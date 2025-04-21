const Mailjet = require('node-mailjet')

const mailjet = Mailjet.apiConnect(
  process.env.MAILJET_USER,
  process.env.MAILJET_PASSWORD
)

/*
Attachments format:
{
  "ContentType": "text/plain",
  "Filename": "test.txt",
  "Base64Content": "VGhpcyBpcyB5b3VyIGF0dGFjaGVkIGZpbGUhISEK"
}
*/

export const sendEmail = async ({ email, name, subject, html, bcc = [], noBcc, from }) => {
  const body = {
    Messages: [
      {
        From: from || {
          Email: 'system@protocodex.com',
          Name: "Artifact Guesser"
        },
        To: [
          {
            Email: email,
            Name: name
          }
        ],
        Bcc: noBcc ? [] : [
          {
            Email: 'sam@protocodex.com',
            Name: "Artifact Guesser"
          },
          ...bcc
        ],
        Subject: subject,
        HTMLPart: html.replace(/\n/g, '<br />'),
      }
    ]
  }

  console.log(body)
  console.log('Sending...')

  const request = mailjet
    .post("send", { version: 'v3.1' })
    .request(body)
  
  const result = await request
  console.log('Email send status: ' + JSON.stringify(result.body?.Messages?.[0].Status, null, 2))

  return true
}

export const sendTemplateMail = async ({ to, templateId, subject, variables, bcc = [], attachments }) => {
  const body = {
    Messages: [
      {
        From: {
          Email: 'system@protocodex.com',
          Name: "Artifact Guesser"
        },
        To: [
          {
            Email: to.email,
            Name: to.name
          }
        ],
        Bcc: [
          {
            Email: 'sam@protocodex.com',
            Name: "Artifact Guesser"
          },
          ...(bcc.map(b => ({ Email: b, Name: "Artifact Guesser" })))
        ],
        TemplateID: templateId,
        TemplateLanguage: true,
        Subject: subject,
        Variables: variables,
        Attachments: attachments
      }
    ]
  }
  
  // console.log(JSON.stringify(body, null, 2))

  const request = mailjet
    .post("send", { version: 'v3.1' })
    .request(body)
  
  const result = await request
  console.log('Email send status: ' + JSON.stringify(result.body?.Messages?.[0].Status, null, 2))

  return true
}