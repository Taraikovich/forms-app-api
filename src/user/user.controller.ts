import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles('ADMIN')
  @Get('all')
  getAllUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.userService.getAllUsers(Number(page), Number(limit));
  }

  @Roles('ADMIN')
  @Post('block')
  blockUser(@Body() body: { usersId: string[] }) {
    return this.userService.blockUsers(body.usersId);
  }

  @Roles('ADMIN')
  @Post('unblock')
  unblockUser(@Body() body: { usersId: string[] }) {
    return this.userService.unblockUsers(body.usersId);
  }

  @Roles('ADMIN')
  @Post('delete')
  deleteUser(@Body() body: { usersId: string[] }) {
    return this.userService.deleteUsers(body.usersId);
  }

  @Roles('ADMIN')
  @Post('role')
  setRole(@Body() body: { usersId: string[]; role: Role }) {
    return this.userService.setRole(body.usersId, body.role);
  }
}
