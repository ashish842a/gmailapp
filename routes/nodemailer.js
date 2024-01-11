const nodemailer = require("nodemailer");
const googleApis = require("googleapis");
const mail = require("./mail");
const REDIRECT_URI = `https://developers.google.com/oauthplayground`;
const CLIENT_ID = `944587520626-iqno53pt4h8l1mfq1h5d9i6gemhu5164.apps.googleusercontent.com`;
const CLIENT_SECRET = `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`;
const REFRESH_TOKEN = `1//04q7POHY-HxYXCgYIARAAGAQSNwF-L9IrtMb8mEcngIVAqPbceh5hJKVBgw_cqfun-Kn-ND3M18Z4810TVryW9MPDfKjU-GiFI4M`;
const authClient = new googleApis.google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET,
REDIRECT_URI);
authClient.setCredentials({refresh_token: REFRESH_TOKEN});

async function mailer(mail,msg){
 try{
 const ACCESS_TOKEN = await authClient.getAccessToken();
 const transport = nodemailer.createTransport({
 service: "gmail",
 auth: {
 type: "OAuth2",
 user: "ashishkumar0842a@gmail.com",
 clientId: CLIENT_ID,
 clientSecret: CLIENT_SECRET,
 refreshToken: REFRESH_TOKEN,
 accessToken: ACCESS_TOKEN
 }
 })
 const details = {
 from: "ashishkumar0842a@gmail.com",
 to:`${mail}`,
 subject: "AMil services",
 text: "message text",
 html: `<h2>${msg}</h2>`
 }
 const result = await transport.sendMail(details);
 return result;
 }
 catch(err){
 return err;
 }
}
// mailer().then(res => {
//  console.log("sent mail !", res);
// })

module.exports=mailer;