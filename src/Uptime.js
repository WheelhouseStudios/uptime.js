'use strict';

const EventEmitter = require('eventemitter3'),
      request  = require('request'),
      winston = require('winston');

class Uptime extends EventEmitter{
   
    constructor(options) {
        super();
        const logTransports = [
          new winston.transports.Console(),
        ];
        if (!options || (options && (!options.SLACK_WEBHOOK_URL))) {
          throw new Error("You need to specify an SLACK_WEBHOOK_URL");
        }
        this.SLACK_WEBHOOK_URL = options.SLACK_WEBHOOK_URL;
        this.pingInterval = options.PING_INTERVAL || 1*1000*60;
        this.serviceStatus = {};
        if (options.LOG_FILE_NAME) {
          logTransports.push(new winston.transports.File({
            filename: options.LOG_FILE_NAME,
            level: options.LOG_FILE_LEVEL || 'info',
          }));
        }
        this.logger = winston.createLogger({
          level: 'debug',
          format: winston.format.json(),
          transports: logTransports,
        })
    }
 
    pingService(url, cb){
      
      request({
        method: 'GET',
        uri: url,
        time: true
      }, (err, res, body) => {
        if (!err && res.statusCode == 200) {
          // we'll use the time from the point we try to establish a connection with
          // the service until the first byte is received
          cb(res.timingPhases.firstByte);
        } else {
          cb('OUTAGE');
        }
      })
    }
        
    postToSlack(serviceUrl){
      
      var message = "";
      if (this.serviceStatus[serviceUrl].status == 'DEGRADED'){
          message = "`Degraded System Service !!!` :skull: ";
      } else if (this.serviceStatus[serviceUrl].status == 'OPERATIONAL') {
         message = "System Operational :robot_face:";
      } else if (this.serviceStatus[serviceUrl].status == 'OUTAGE') {
         message = "System Outage :zzz:";
      }
      let slackPayload = {
        text: `*${message}*\n${serviceUrl}`
      };

      this.logger.log('warn', slackPayload.text);
    
      request({
        method: 'POST',
        uri: this.SLACK_WEBHOOK_URL,
        body: slackPayload,
        json: true
      }, (err, res, body) => {
        if (err) this.logger.log('error', `Error posting to Slack: ${err}`);
      })
    }
    
    monitor(websites){
      websites.forEach(service => {
        this.serviceStatus[service.url] = {
          status: 'OPERATIONAL', // initialize all services as operational when we start
          responseTimes: [], // array containing the responses times for last 3 pings
          timeout: service.timeout, // load up the timout from the config
          checkDegraded: service.checkDegraded || 'yes', // Monitor degraded service
        }

        this.logger.log('info', `Monitoring ${service.url}`);
      
        setInterval(() => {
          this.pingService(service.url, (serviceResponse) => {
            this.logger.log('debug', `Pinging ${service.url}`);
            if (serviceResponse === 'OUTAGE' && this.serviceStatus[service.url].status !== 'OUTAGE') {
              // only update and post to Slack on state change
              this.serviceStatus[service.url].status = 'OUTAGE';
              this.postToSlack(service.url);
            } else {
              let responseTimes = this.serviceStatus[service.url].responseTimes
              responseTimes.push(serviceResponse);
      
              // check degraded performance if we have 3 responses so we can average them
              if (responseTimes.length > 3) {
                // remove the oldest response time (beginning of array)
                responseTimes.shift();
      
                // compute average of last 3 response times
                let avgResTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
                let currService = this.serviceStatus[service.url];
      
                if (avgResTime > currService.timeout && currService.status !== 'DEGRADED' && currService.checkDegraded === 'yes') {
                  currService.status = 'DEGRADED';
                  this.postToSlack(service.url);
                } else if (avgResTime < currService.timeout && currService.status !== 'OPERATIONAL') {
                  currService.status = 'OPERATIONAL';
                  this.postToSlack(service.url);
                }
              }
      
            }
          })
        }, this.pingInterval);
      });
    }
}

module.exports = Uptime;