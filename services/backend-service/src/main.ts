import 'module-alias/register';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';

import * as helmet from 'helmet';
import { AppModule } from './app.module';
import {
  isProduction,
  serverName,
  serverPort,
  serverVersion,
  swaggerConfiguration,
} from './common';
import { google } from 'googleapis';
import { Url } from 'node:url';
import { multer } from 'multer';
import fs from 'fs';
import { file } from 'googleapis/build/src/apis/file';

const CLIENT_ID = process.env.client_id;
const CLIENT_SECRET = process.env.client_secret;
const REDIRECT_URI = process.env.redirect_uri;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

var authed = false;

var name, pic;

const SCOPES = "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile";

const logger = new Logger(`${serverName}@${serverVersion}`);

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './document')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
});

var upload = multer({ storage: storage })
  .single('file'); // Field name and max count

const bootstrapApplication = async () => {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      disableErrorMessages: isProduction,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  if (!isProduction) {
    app.enableCors({
      methods: '*',
      allowedHeaders: '*',
      origin: '*',
    });
  } else {
    app.enableCors({
      methods: '*',
      allowedHeaders: '*',
      origin: '*',
    });
  }

  app.use(helmet());

  app.use('/google/callback', async (req, res) => {
    console.log();
    const code = req.query.code;
    if (code) {
      oAuth2Client.getToken(code, function (error, tokens) {
        if (error) {
          console.log("Error in Authenticating");
          console.log(error);
        } else {
          console.log("Successfully authenticated");
          console.log(tokens);
          oAuth2Client.setCredentials(tokens);
          authed = true;
          res.redirect('/google');
        }
      })
    }
  });

  app.use('/google', async (req, res) => {
    if (!authed) {
      var url = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
      });
      console.log(url);
      res.json({ url: url });
    } else {
      //res.json({ success: 'success' });
      var oath2 = google.oauth2({
        auth: oAuth2Client,
        version: 'v2'
      });

      oath2.userinfo.get((error, response) => {
        console.log(response.data);
        name = response.data.name;
        pic = response.data.picture

        res.json({ name: name, pic: pic });
      })
    }
  });

  app.use('/upload', (req, res) => {
    upload(req, res, (error) => {
      if (error) throw error
      console.log(req.file.path);
      const drive = google.drive({
        version: 'v3',
        auth: oAuth2Client
      });

      const filemetadata = {
        name: req.file.filename
      }

      const media = {
        mimeType: req.file.mimeType,
        body: fs.createReadStream(req.file.path)
      }

      drive.files.create({
        requestBody: filemetadata,
        media: media,
        fields: "id"
      }, (error, file) => {
        if (error) throw error;

        // delete the file images folder

        fs.unlinkSync(req.file.path);
        res.json({ name: name, pic: pic, success: false });
      })
    })
  });

  app.use('/health', (req, res) => {
    res.json({ ready: true });
  });

  const document = SwaggerModule.createDocument(app, swaggerConfiguration);
  SwaggerModule.setup('/swagger', app, document);



  await app.listenAsync(serverPort);
  logger.log(`HTTP server is up & running on http://localhost:${serverPort}/swagger`);

  return app;
};

export default bootstrapApplication().catch((err) => {
  logger.log(err);
  process.exit(1);
});
