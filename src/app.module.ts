import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { ConfigModule } from '@nestjs/config';
import { Student } from './entities/student.entity';
import { Hostel } from './entities/hostel.entity';
import { Room } from './entities/room.entity';
import { RoomBooking } from './entities/room-booking.entity';
import { MorganMiddleware } from '@nest-middlewares/morgan';
import { Admin } from './entities/admin.entity';
import { MulterModule } from '@nestjs/platform-express';
import { S3Client } from '@aws-sdk/client-s3';
import * as multerS3 from 'multer-s3';
import * as process from 'process';

const s3 = new S3Client({
  region: 'us-east-2',

  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'AKIASXJSDQAVHLI5RWOH',
    secretAccessKey:
      process.env.AWS_SECRET_KEY || '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',
  },
});

@Module({
  imports: [
    MulterModule.register({
      storage: multerS3({
        s3: s3,
        bucket: 'ashesi-hsms',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: function (req, file, cb) {
          cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
          cb(null, Date.now().toString() + '.jpg');
        },
      }),
    }),
    ConfigModule.forRoot(),
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
      port: 3001,
    }),
    TypeOrmModule.forFeature([Student, Hostel, Room, RoomBooking, Admin]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      /* host: process.env.DATABASE_HOST || 'localhost',
      port: 5432,
      username: 'username',
      password: 'password',
      database: 'database_hsms',*/
      autoLoadEntities: true,
      synchronize: true,
      logging: ['error', 'warn'],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    MorganMiddleware.configure('dev');
    consumer.apply(MorganMiddleware).forRoutes('api');
  }
}
