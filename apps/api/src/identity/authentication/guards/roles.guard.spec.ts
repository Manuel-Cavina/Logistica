import {
  type ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from './roles.guard';

class PlainController {
  open(): string {
    return 'ok';
  }
}

@Roles('CLIENT')
class ClassRestrictedController {
  open(): string {
    return 'ok';
  }

  @Roles('TRANSPORTER')
  transporterOnly(): string {
    return 'ok';
  }
}

class MethodRestrictedController {
  @Roles('CLIENT', 'TRANSPORTER')
  sharedRoute(): string {
    return 'ok';
  }
}

function createExecutionContext(
  controller: new () => unknown,
  handlerName: string,
  user?: { accountId: string; role?: 'CLIENT' | 'TRANSPORTER' | 'ADMIN' },
): ExecutionContext {
  return {
    getClass: () => controller,
    getHandler: () => controller.prototype[handlerName as keyof typeof controller.prototype],
    switchToHttp: () =>
      ({
        getRequest: () => ({ user }),
      }) as ReturnType<ExecutionContext['switchToHttp']>,
    getArgs: () => [],
    getArgByIndex: () => undefined,
    switchToRpc: () => ({}) as ReturnType<ExecutionContext['switchToRpc']>,
    switchToWs: () => ({}) as ReturnType<ExecutionContext['switchToWs']>,
    getType: () => 'http',
  } as ExecutionContext;
}

describe('RolesGuard', () => {
  let guard: RolesGuard;

  beforeEach(() => {
    guard = new RolesGuard(new Reflector());
  });

  it('allows access when no roles metadata is defined', () => {
    const context = createExecutionContext(PlainController, 'open', {
      accountId: 'account-id',
      role: 'CLIENT',
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('allows access when the authenticated role matches the class metadata', () => {
    const context = createExecutionContext(ClassRestrictedController, 'open', {
      accountId: 'account-id',
      role: 'CLIENT',
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('uses method metadata before class metadata', () => {
    const context = createExecutionContext(
      ClassRestrictedController,
      'transporterOnly',
      {
        accountId: 'account-id',
        role: 'TRANSPORTER',
      },
    );

    expect(guard.canActivate(context)).toBe(true);
  });

  it('allows access when one of the declared roles matches', () => {
    const context = createExecutionContext(
      MethodRestrictedController,
      'sharedRoute',
      {
        accountId: 'account-id',
        role: 'TRANSPORTER',
      },
    );

    expect(guard.canActivate(context)).toBe(true);
  });

  it('denies access when the authenticated role does not match', () => {
    const context = createExecutionContext(
      ClassRestrictedController,
      'open',
      {
        accountId: 'account-id',
        role: 'ADMIN',
      },
    );

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('denies access when the request user has no role', () => {
    const context = createExecutionContext(
      MethodRestrictedController,
      'sharedRoute',
      {
        accountId: 'account-id',
      },
    );

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
