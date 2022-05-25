import { Inject, Injectable, CACHE_MANAGER } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/sequelize';
import { Tweet } from '../entities/tweet.entity';

import { Cache } from "cache-manager";
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class TweetsCountService {

    private limit = 10;

    constructor(
        @InjectModel(Tweet)
        private tweetModel: typeof Tweet,
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache,
        @InjectQueue('emails')
        private emailsQueue: Queue
        ){}

    @Interval(5000)
    async countTweets(): Promise<void>{
        let offset = await this.cacheManager.get<number>('tweet-offset');

        offset = offset === undefined ? 0 : offset

        const tweets = await this.tweetModel.findAll({
            offset,
            limit: this.limit
        })

        if(tweets.length === this.limit){
            this.cacheManager.set("tweet-offset", offset + this.limit, {
                ttl: 1 * 60 * 10
            });
        }

        console.log(`Achou + ${this.limit} tweets!`);

        // Adiciona a fila
        this.emailsQueue.add({ tweets: tweets.map(elem => elem.toJSON())});

    }
}
