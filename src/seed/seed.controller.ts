import { Controller, Get} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { SeedService } from './seed.service';
import { Auth } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';

<<<<<<< HEAD

=======
>>>>>>> 7b42464aa706ac545888615d4b2aa2c0e9c3e98b
@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) { }


  @Get()
    // @Auth(ValidRoles.ADMIN)
  executeSeed() {
    return this.seedService.runSeed();

  }
}
