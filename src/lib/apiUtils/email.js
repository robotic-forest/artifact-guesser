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

export const sendEmail = async ({ email, name, subject, html, bcc = [] }) => {
  const body = {
    Messages: [
      {
        From: {
          Email: 'system@protocodex.com',
          Name: "Ur Context System"
        },
        To: [
          {
            Email: email,
            Name: name
          }
        ],
        Bcc: [
          {
            Email: 'sam@protocodex.com',
            Name: "Ur Context System"
          },
          ...bcc
        ],
        Subject: subject,
        HTMLPart: html.replace(/\n/g, '<br />'),
      }
    ]
  }

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
          Name: "Ur Context System"
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
            Name: "Ur Context System"
          },
          ...(bcc.map(b => ({ Email: b, Name: "Ur Context System" })))
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