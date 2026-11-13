import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { AuthController, AuthGuard, OptionalAuthGuard } from './auth';
import { Lead, Org, Post, Proposal, User } from './entities';
import { OrgController } from './org';
import { LeadsController } from './leads';
import { PostsController } from './posts';
import { SeedService } from './seed';

const dataDir = join(process.cwd(), 'data');
mkdirSync(dataDir, { recursive: true });

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: join(dataDir, 'matchmint.db'),
      entities: [Org, User, Post, Proposal, Lead],
      synchronize: true, // fine for the MVP; switch to migrations before production
    }),
    TypeOrmModule.forFeature([Org, User, Post, Proposal, Lead]),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET');
        if (!secret || secret === 'change-me') throw new Error('Set JWT_SECRET in apps/api/.env');
        return { secret, signOptions: { expiresIn: '7d' } };
      },
    }),
  ],
  controllers: [AuthController, OrgController, PostsController, LeadsController],
  providers: [AuthGuard, OptionalAuthGuard, SeedService],
})
export class AppModule {}
