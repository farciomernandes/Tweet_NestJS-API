import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SequelizeModule } from '@nestjs/sequelize';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TweetsModule } from './tweets/tweets.module';
import { MailingModule } from './mailing/mailing.module';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'redis',
        port: 6379
      }
    }),
    ScheduleModule.forRoot(),
    SequelizeModule.forRoot({
      dialect: 'sqlite',
      host: join(__dirname, "database.sqlite"),
      autoLoadModels: true,
      synchronize: true
    }),
    TweetsModule,
    MailingModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
