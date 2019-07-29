# Node uptime bot

Uptime monitor in Node.js that send status changes to Chatbots.  Forked from https://github.com/intelligo-systems/uptime.js.  Added logging, status check interval configuration, and modified slack messages.


| [Installation][] | [Usage][] | [Setting up Slack][] | [License][] |

# Installation

```
yarn add WheelhouseStudios/uptime.js
```

# Usage

```js
const Uptime   = require('uptime.js');

const bot = new Uptime({
  SLACK_WEBHOOK_URL: 'SLACK_WEBHOOK_URL'
});

bot.monitor([
  {
    url: 'https://www.intelligo.systems', // URL of service we'll be pining
    timeout: 200 // threshold in milliseconds above which is considered degraded performance
  }
]);

```

# Setting up Slack

Head on over to the Incoming WebHooks Slack app. If you're signed in to your Slack Workspace you should see an Add Configuration button. Hit it!

![screenshot](https://raw.githubusercontent.com/WheelhouseStudios/uptime.js/master/.github/image1.png)

Select or create a new channel then hit the Add Incoming WebHooks integration

![screenshot](https://raw.githubusercontent.com/WheelhouseStudios/uptime.js/master/.github/image2.png)

Grab the WebHook URL and paste it into the `SLACK_WEBHOOK_URL`, which would look like so:

`SLACK_WEBHOOK_URL=https://hooks.slack.com/services/XXXXXX/YYYYYY/XXXXXXXXXXXX`

![screenshot](https://raw.githubusercontent.com/WheelhouseStudios/uptime.js/master/.github/image3.png)

You can update 

```js
bot.monitor([
  {
    url: 'https://www.intelligo.systems', // URL of service we'll be pining
    timeout: 200 // threshold in milliseconds above which is considered degraded performance
  }
]);
``` 
with the services you wish to monitor and throw the code up on a server.

![screenshot](https://raw.githubusercontent.com/WheelhouseStudios/uptime.js/master/.github/image4.png)

## License

> Copyright (C) 2019 Intelligo Systems.  
> uptime.js is open-sourced software licensed under the [MIT](https://opensource.org/licenses/MIT) license.  
> (See the [LICENSE](https://github.com/WheelhouseStudios/uptime.js/blob/master/LICENSE) file for the whole license text.)

**[⬆ back to top](#node-uptime-bot)**

[Installation]:#installation
[Usage]:#usage
[Setting up Slack]:#setting-up-slack
[Contributors]:#contributors
[License]:#license

