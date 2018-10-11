"use strict";

var AWS = require('aws-sdk');

console.log("AWS Lambda SES Forwarder // @arithmetric // Version 4.2.0");

// Configure the S3 bucket and key prefix for stored raw emails, and the
// mapping of email addresses to forward from and to.
//
// Expected keys/values:
//
// - fromEmail: Forwarded emails will come from this verified address
//
// - subjectPrefix: Forwarded emails subject will contain this prefix
//
// - emailBucket: S3 bucket name where SES stores emails.
//
// - emailKeyPrefix: S3 key name prefix where SES stores email. Include the
//   trailing slash.
//
// - forwardMapping: Object where the key is the lowercase email address from
//   which to forward and the value is an array of email addresses to which to
//   send the message.
//
//   To match all email addresses on a domain, use a key without the name part
//   of an email address before the "at" symbol (i.e. `@example.com`).
//
//   To match a mailbox name on all domains, use a key without the "at" symbol
//   and domain part of an email address (i.e. `info`).
var defaultConfig = {
  fromEmail: "", //"hello@troop161shoreham.org",
  subjectPrefix: "",
  emailBucket: "troop161-hello-email-archive",
  emailKeyPrefix: "", // putting in root
  forwardMapping: {
    "hello@troop161shoreham.org": [
      "michael.eyring@icloud.com",
      "shemmy01@aol.com",
      "myakaboski@hotmail.com"
    ],
    "abuse@troop161shoreham.org": [
      "michael.eyring@icloud.com"
    ],
    "@troop161shoreham.org": [
      "michael.eyring@icloud.com"
    ],
    "scoutmaster@troop161shoreham.org": [
      "myakaboski@hotmail.com",
      "shemmy01@aol.com",
      "michael.eyring@icloud.com"
    ],
    "info": [
      "michael.eyring@icloud.com"
    ],
    "webmaster@troop161shoreham.org": [
      "michael.eyring@gmail.com"
    ],
    "info@troop161shoreham.org": [
      "michael.eyring@icloud.com"
    ],
    "leaders@troop161shoreham.org": [
      "drjohn32@hotmail.com", // Dr A
      "DBlunnie@aol.com", // Dan Blunnie
      "dougherty.bob.jr@gmail.com", // Bob Dougherty
      "raymondjepp@aol.com", // Ray Epp
      "michael.eyring@gmail.com", // Mike Eyring
      "Scouting161@gmail.com", // Shelley Fuhrmann
      "troop161asm@gmail.com", // Paul Hernandez
      "ahiggins74@yahoo.com", // Anthony Higgins
      "ralph308@optimum.net", // Ralph Hudson
      "sjfd174@yahoo.com", // Glen Kaleita, Chartered Org Rep
      // Connie Kenter is missing an email address
      "ksatlaw@optimum.net", //Bob Kohlus
      "kclpdt@verizon.net", // Kevin Lane
      "RML1398@optonline.net", // Rich Ledda
      "brettlynchturf@gmail.com", // Brett Lynch
      "mcmja96@gmail.com", // John McMorris
      "hs01jc02@yahoo.com", // Lisa Pozgay
      "lmraynor5@optimum.net", // Larry Raynor
      "JRicca3@gmail.com", //  Joe Ricca
      "shemmy01@aol.com", // Jane Sherman
      "sherm66@optonline.net", // Jon Sherman
      "Silvivega1969@gmail.com", // Silvi Vega
      "emeraldlandinc@aol.com", // Ken Wrigley
      "MYakaboski@hotmail.com" // Matt Yakaboski
    ],
    "parents@troop161shoreham.org": [
      "theresa531@optonline.net", // Thersa Aloisio
      "vksrn@aol.com", // Bob Spice
      // above this line were listed as adults but not leaders, below records come from scout records
      "DALIPERTI@optonline.net", // Donna Aliperti, mother of Chad Aliperti
      "vjmb00@aol.com", // Veronica Bitalvo, mother of Anthony Bitalvo, Michael Bitalvo, Peter Bitalvo
//      "DBlunnie@aol.com", // Dan Blunnie, father of Conner Blunnie
      "KMBlunnie@aol.com", //Katrina Blunnie, mother of Conner Blunnie
      "viviancalovi@gmail.com", // Vivian Calovi, mother of Alex Calovi
      "subdivisions@optonline.net", // Christina Carrier, mother of Ben Carrier, Patrick Carrier
      "jbages23@gmail.com", // James Constantine, father of Thomas Constantine
      "str1129@gmail.com", // Shannon Constantine, mother of Thomas Constantine
      "techteach49@gmail.com", // Brian Costello, father of Andrew Costello
      "Malinda349@yahoo.com", // Malinda Martinez, mother of Ivan Cruz
      "mcdilisio@gmail.com", // Michael Di Lisio, father of Eric DiLisio
      "jcdilisio@aol.com",  // Joanne Di Lisio, mother of Eric DiLisio
//      "Dougherty.bob.jr@gmail.com", // Bob Dougherty, father of Brandon Dougherty
//      "raymondjepp@aol.com", // Ray Epp, Father of Erik Epp
      "kjekristen@aol.com", // Kristen Epp, Mother of Erik Epp
//      "michael.eyring@gmail.com", // Michael Eyring, Father of Jason Eyring
      "gail.eyring@gmail.com",  // Gail Eyring, Mother of Jason Eyring
      "hkfield@yahoo.com", // Haleh and Keith Field, Mother and Father of Jake Field
      "dylkat@optonline.net", // Kathleen Friedlander, mother of Brendan Friedlander 
      "Alscappres@aol.com",  // Scott Fuhrmann, Father of Erich Fuhrmann, Joshua Fuhrmann
      "Scouting161@gmail.com",  // Shelley Fuhrmann, Mother of Erich Fuhrmann, Joshua Fuhrmann
      "bino2@optonline.net", // Karen Gambino, mother of Dominick Gambino
      "pamgaree@gmail.com", // Pam Garee, mother of Connor Garee
      "dordor1@optonline.net", // Doreen Geraci, mother of Dominic Geraci
      "kgphysics@aol.com", // Ken German, father of John German
      "Thaarke@yahoo.com", // Ted Haarke, father of Teddy Haarke
      "mhd@islands.vi", // Mark Hansen, father of Liam Hansen
      "Silvivega1969@gmail.com", // Silvi Vega, mother of Liam Hansen
      "rahs27@aol.com", // Rachel Hearn-Somma, Mother of Max Hearn-Somma
      "troop161asm@gmail.com",  // Paul Hernandez father of Brian Hernandez
//      "ahiggins74@yahoo.com",  // Anthony Higgins, father of Anthony Higgins
//      "ralph308@optimum.net", // Ralph Hudson, father of Bret Hudson, Sean Hudson
      "Clanhudson06@gmail.com", // Jennifer Hudson, mother of Bret Hudson, Sean Hudson
      "dmmcs@optonline.net", //  Dina and Mike Kelly, parents of Sean Kelly
      "RitaKent63@gmail.com", // Rita Kent, Mother of Gabe Kent 
      "relaycom@aol.com", // Dennis Kenter, father of Christopher Kenter
      "ckenter67@gmail.com", // Connie Kenter, mother of Christopher Kenter
      "guppywmk@optonline.net", // Wendy King, mother of Billy King, Brendan King
//      "kclpdt@verizon.net", // Kevin and Colleen Lane, parents of Denis Lane, Thomas Lane
      "bkklynch@optonline.net", // Kristine Lynch, mother of Colin Lynch, Kaden Lynch
//      "brettlynchturf@gmail.com", // Brett Lynch, father of Colin Lynch, Kaden Lynch
      "kjmcclell@yahoo.com", // Keith McClelland, father of Dylan McClelland. Note email only in scout portion not parent
      "tmcclintockjr@optonline.net", // Thomas McClintock, father of Aaron McClintock
      "ruckus987@gmail.com", // Mickey McKay, mother of Donald McKay
      "mcmja96@gmail.com", // John/Alisa McMorris
      "rmudl2@optonline.net",  // Robert Mudzinski, father of Robert Mudzinski
      "norgelady@optimum.net", // Karen O’Toole, mother of Ronan O’Toole
      "hs01jc02@yahoo.com", // Lisa Pozgay, mother of Hunter Pozgay, Joe Pozgay
      "ksprovencher@yahoo.com", // Karen Provencher mother of James Provencher
//      "lmraynor5@optimum.net", // Lawrence Raynor, father of Jacob Raynor
      "Shellzando@optonline.net", // Michael Scielzi, father of Jake Scielzi, Josh Scielzi
      "doughirish@aol.com", // Patrick Dougherty, Grandfather of Keegan Sellner
//      "shemmy01@aol.com", // Jane Sherman mother of Matthew Sherman
//      "sherm66@optonline.net", // Jon Sherman, father of Matthew Sherman
//      "MYakaboski@hotmail.com", // Matt Yakaboski, father of Matt Yakaboski
      "Kyakaboski@optonline.net" // Kathryn Yakaboski, mother of Matt Yakaboski
    ]
  }
};

/**
 * Parses the SES event record provided for the `mail` and `receipients` data.
 *
 * @param {object} data - Data bundle with context, email, etc.
 *
 * @return {object} - Promise resolved with data.
 */
exports.parseEvent = function(data) {
  console.log("Data: ", data);
  // Validate characteristics of a SES event record.
  if (!data.event ||
      !data.event.hasOwnProperty('Records') ||
      data.event.Records.length !== 1 ||
      !data.event.Records[0].hasOwnProperty('eventSource') ||
      data.event.Records[0].eventSource !== 'aws:ses' ||
      data.event.Records[0].eventVersion !== '1.0') {
      data.log({message: "parseEvent() received invalid SES message:",
      level: "error", event: JSON.stringify(data.event)});
    return Promise.reject(new Error('Error: Received invalid SES message.'));
  }

  data.email = data.event.Records[0].ses.mail;
  data.recipients = data.event.Records[0].ses.receipt.recipients;
  return Promise.resolve(data);
};

/**
 * Transforms the original recipients to the desired forwarded destinations.
 *
 * @param {object} data - Data bundle with context, email, etc.
 *
 * @return {object} - Promise resolved with data.
 */
exports.transformRecipients = function(data) {
  var newRecipients = [];
  data.originalRecipients = data.recipients;
  data.recipients.forEach(function(origEmail) {
    var origEmailKey = origEmail.toLowerCase();
    if (data.config.forwardMapping.hasOwnProperty(origEmailKey)) {
      newRecipients = newRecipients.concat(
        data.config.forwardMapping[origEmailKey]);
      data.originalRecipient = origEmail;
    } else {
      var origEmailDomain;
      var origEmailUser;
      var pos = origEmailKey.lastIndexOf("@");
      if (pos === -1) {
        origEmailUser = origEmailKey;
      } else {
        origEmailDomain = origEmailKey.slice(pos);
        origEmailUser = origEmailKey.slice(0, pos);
      }
      if (origEmailDomain &&
          data.config.forwardMapping.hasOwnProperty(origEmailDomain)) {
        newRecipients = newRecipients.concat(
          data.config.forwardMapping[origEmailDomain]);
        data.originalRecipient = origEmail;
      } else if (origEmailUser &&
        data.config.forwardMapping.hasOwnProperty(origEmailUser)) {
        newRecipients = newRecipients.concat(
          data.config.forwardMapping[origEmailUser]);
        data.originalRecipient = origEmail;
      }
    }
  });

  if (!newRecipients.length) {
    data.log({message: "Finishing process. No new recipients found for " +
      "original destinations: " + data.originalRecipients.join(", "),
      level: "info"});
    return data.callback();
  }

  data.recipients = newRecipients;
  return Promise.resolve(data);
};

/**
 * Fetches the message data from S3.
 *
 * @param {object} data - Data bundle with context, email, etc.
 *
 * @return {object} - Promise resolved with data.
 */
exports.fetchMessage = function(data) {
  // Copying email object to ensure read permission
  data.log({level: "info", message: "Fetching email at s3://" +
    data.config.emailBucket + '/' + data.config.emailKeyPrefix +
    data.email.messageId});
  return new Promise(function(resolve, reject) {
    data.s3.copyObject({
      Bucket: data.config.emailBucket,
      CopySource: data.config.emailBucket + '/' + data.config.emailKeyPrefix +
        data.email.messageId,
      Key: data.config.emailKeyPrefix + data.email.messageId,
      ACL: 'private',
      ContentType: 'text/plain',
      StorageClass: 'STANDARD'
    }, function(err) {
      if (err) {
        data.log({level: "error", message: "copyObject() returned error:",
          error: err, stack: err.stack});
        return reject(
          new Error("Error: Could not make readable copy of email."));
      }

      // Load the raw email from S3
      data.s3.getObject({
        Bucket: data.config.emailBucket,
        Key: data.config.emailKeyPrefix + data.email.messageId
      }, function(err, result) {
        if (err) {
          data.log({level: "error", message: "getObject() returned error:",
            error: err, stack: err.stack});
          return reject(
            new Error("Error: Failed to load message body from S3."));
        }
        data.emailData = result.Body.toString();
        return resolve(data);
      });
    });
  });
};

/**
 * Processes the message data, making updates to recipients and other headers
 * before forwarding message.
 *
 * @param {object} data - Data bundle with context, email, etc.
 *
 * @return {object} - Promise resolved with data.
 */
exports.processMessage = function(data) {
  var match = data.emailData.match(/^((?:.+\r?\n)*)(\r?\n(?:.*\s+)*)/m);
  var header = match && match[1] ? match[1] : data.emailData;
  var body = match && match[2] ? match[2] : '';

  // Add "Reply-To:" with the "From" address if it doesn't already exists
  if (!/^Reply-To: /mi.test(header)) {
    match = header.match(/^From: (.*(?:\r?\n\s+.*)*\r?\n)/m);
    var from = match && match[1] ? match[1] : '';
    if (from) {
      header = header + 'Reply-To: ' + from;
      data.log({level: "info", message: "Added Reply-To address of: " + from});
    } else {
      data.log({level: "info", message: "Reply-To address not added because " +
       "From address was not properly extracted."});
    }
  }

  // SES does not allow sending messages from an unverified address,
  // so replace the message's "From:" header with the original
  // recipient (which is a verified domain)
  header = header.replace(
    /^From: (.*(?:\r?\n\s+.*)*)/mg,
    function(match, from) {
      var fromText;
      if (data.config.fromEmail) {
        fromText = 'From: ' + from.replace(/<(.*)>/, '').trim() +
        ' <' + data.config.fromEmail + '>';
      } else {
        fromText = 'From: ' + from.replace('<', 'at ').replace('>', '') +
        ' <' + data.originalRecipient + '>';
      }
      return fromText;
    });

  // Add a prefix to the Subject
  if (data.config.subjectPrefix) {
    header = header.replace(
      /^Subject: (.*)/mg,
      function(match, subject) {
        return 'Subject: ' + data.config.subjectPrefix + subject;
      });
  }

  // Replace original 'To' header with a manually defined one
  if (data.config.toEmail) {
    header = header.replace(/^To: (.*)/mg, () => 'To: ' + data.config.toEmail);
  }

  // Remove the Return-Path header.
  header = header.replace(/^Return-Path: (.*)\r?\n/mg, '');

  // Remove Sender header.
  header = header.replace(/^Sender: (.*)\r?\n/mg, '');

  // Remove Message-ID header.
  header = header.replace(/^Message-ID: (.*)\r?\n/mig, '');

  // Remove all DKIM-Signature headers to prevent triggering an
  // "InvalidParameterValue: Duplicate header 'DKIM-Signature'" error.
  // These signatures will likely be invalid anyways, since the From
  // header was modified.
  header = header.replace(/^DKIM-Signature: .*\r?\n(\s+.*\r?\n)*/mg, '');

  data.emailData = header + body;
  return Promise.resolve(data);
};

/**
 * Send email using the SES sendRawEmail command.
 *
 * @param {object} data - Data bundle with context, email, etc.
 *
 * @return {object} - Promise resolved with data.
 */
exports.sendMessage = function(data) {
  var params = {
    Destinations: data.recipients,
    Source: data.originalRecipient,
    RawMessage: {
      Data: data.emailData
    }
  };
  data.log({level: "info", message: "sendMessage: Sending email via SES. " +
    "Original recipients: " + data.originalRecipients.join(", ") +
    ". Transformed recipients: " + data.recipients.join(", ") + "."});
  return new Promise(function(resolve, reject) {
    data.ses.sendRawEmail(params, function(err, result) {
      if (err) {
        data.log({level: "error", message: "sendRawEmail() returned error.",
          error: err, stack: err.stack});
        return reject(new Error('Error: Email sending failed.'));
      }
      data.log({level: "info", message: "sendRawEmail() successful.",
        result: result});
      resolve(data);
    });
  });
};

/**
 * Handler function to be invoked by AWS Lambda with an inbound SES email as
 * the event.
 *
 * @param {object} event - Lambda event from inbound email received by AWS SES.
 * @param {object} context - Lambda context object.
 * @param {object} callback - Lambda callback object.
 * @param {object} overrides - Overrides for the default data, including the
 * configuration, SES object, and S3 object.
 */
exports.handler = function(event, context, callback, overrides) {
  var steps = overrides && overrides.steps ? overrides.steps :
  [
    exports.parseEvent,
    exports.transformRecipients,
    exports.fetchMessage,
    exports.processMessage,
    exports.sendMessage
  ];
  var data = {
    event: event,
    callback: callback,
    context: context,
    config: overrides && overrides.config ? overrides.config : defaultConfig,
    log: overrides && overrides.log ? overrides.log : console.log,
    ses: overrides && overrides.ses ? overrides.ses : new AWS.SES(),
    s3: overrides && overrides.s3 ?
      overrides.s3 : new AWS.S3({signatureVersion: 'v4'})
  };
  Promise.series(steps, data)
    .then(function(data) {
      data.log({level: "info", message: "Process finished successfully."});
      return data.callback();
    })
    .catch(function(err) {
      data.log({level: "error", message: "Step returned error: " + err.message,
        error: err, stack: err.stack});
      return data.callback(new Error("Error: Step returned error."));
    });
};

Promise.series = function(promises, initValue) {
  return promises.reduce(function(chain, promise) {
    if (typeof promise !== 'function') {
      return Promise.reject(new Error("Error: Invalid promise item: " +
        promise));
    }
    return chain.then(promise);
  }, Promise.resolve(initValue));
};
