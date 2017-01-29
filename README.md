<!--

This document is written
using Semantic Linefeeds.
See http://rhodesmill.org/brandon/2012/one-sentence-per-line/
for an explanation
of why linebreaks are
the way they are.)

-->

# Bedhunter

Bedhunter crawls Kijiji
looking for apartments
so you don't have to.
By defining heuristics
to qualify listings
it can rank listings
by desirability
more precisely
than by the simple filtering available
in Kijiji's web interface,
and by searching regularly
t can notify you about listings
which you might otherwise miss.

## Getting Started

### Installation

1. You'll need [Node.js](https://nodejs.org/en/) (and NPM).
    Bedhunter will run
    on the LTS release
    just fine.
2. If you want to generate SMS notifications,
    you'll need a [Twilio](https://www.twilio.com/) account.
    A free trial account should work,
    but it hasn't been tested.
3. Check out a copy
    of the repo:

    ```sh
    $ git clone https://github.com/MrDOS/bedhunter
    $ cd bedhunter
    ```

4. Make a copy of the configuration file
    and modify it
    to suit your preference:

    ```sh
    $ cp config-example.json config.json
    $ your-favourite-editor config.json
    ```

    See the “Configuration” section below
    for details.
5. Launch it:

    ```sh
    ./bedhunter.js
    ```

    You'll probably want
    to use `nohup(1)` or `screen(1)`
    so it runs continuously.

### Configuration

The example configuration file
looks something like this:

```json
{
    "query": {
        "interval": 600000,
        "prefs": {
            "categoryId": 37,
            "locationId": 1700185
        },
        "params": {
            "adType": "OFFER"
        }
    },
    "notification": {
        "debug": true,
        "scoreThreshold": 20,
        "twilioSid": "",
        "twilioToken": "",
        "twilioFrom": "",
        "twilioTo": ""
    }
}
```

Here's what the configuration keys mean:

* `query`: Configures what gets scraped
    from Kijiji.
    * `interval`: How frequently new data is retrieved
        from Kijiji (in seconds).
    * `pres` and `params`: Passed verbatem
        to [kijiji-scraper](https://github.com/mwpenny/kijiji-scraper).
        See that project's documentation
        for details.
* `notification`: Configures what and how notifications
    are sent.
    * `debug`: Indicates that the user
        is still fine-tuning heuristic functions,
        that text notifications
        should be suppressed,
        and that notifications
        should be shown on the console instead.
    * `scoreThreshold`: Notifications will only be generated
        for listings where all scores
        meet or exceed this threshold.
    * `twilioSid` and `twilioToken`: The SID and token
        of your Twilio account.
    * `twilioFrom`: Your Twilio phone number.
    * `twilioTo`: The phone number to which notifications
        should be sent.

You'll also need to set up
some...

### Heuristics

This is
the fun part.
As ads are scraped
from Kijiji,
they're passed through a series
of user-defined scoring functions
to evaluate their suitability.

To get started,
look through the examples given
in the `heuristics-example` directory.
Copy anything you like
into the `heuristics` directory.
Everything you put there
will be detected and used automatically
when you launch the utility.

## Behaviour

### Polling

Poling takes place
at the frequency defined
in the configuration file.
Several things happen
in sequence:

* First, Kijiji is queried
    for new ads.
* Missing scores are computed
    for all ads.
    This process considers
    both new ads which have no scores
    as well as old ads missing scores
    (e.g., where the score calculation
    previously failed,
    or where a new heuristic
    has been introduced).
* Finally, notifications
    are generated and sent.
    Notifications are only sent
    for ads having all scores
    and where all scores meet or surpass
    the score threshold.
