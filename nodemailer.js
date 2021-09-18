import nodemailer from 'nodemailer'
import {google} from "googleapis"



const client_id="543519367783-8rthmcbg05l5ue049mstkmb3qjjugk7e.apps.googleusercontent.com";
const client_secret="cxlJsDxELESfrVCyf0BLtk5j";
const redirect_uri="https://developers.google.com/oauthplayground";
const refresh_token="1//04PhludIcav9LCgYIARAAGAQSNwF-L9IrfRNYEA-156yGy6ScZNkVPZ4JpNsnkK45hFaB8lhgn8wr-FsBr-7SHjjt0Tc8I7QZdVM";

const oAuth2Client= new google.auth.OAuth2(client_id,client_secret,redirect_uri)

oAuth2Client.setCredentials({refresh_token:refresh_token})

const access_token= oAuth2Client.getAccessToken();

export var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type:"OAuth2",
    user: 'one.trial.one.trial@gmail.com',
    clientId:client_id,
    clientSecret:client_secret,
    refreshToken:refresh_token,
    accessToken:access_token
  }
});
