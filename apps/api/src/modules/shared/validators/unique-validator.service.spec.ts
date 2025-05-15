import { Test, TestingModule } from '@nestjs/testing';
import { UniqueValidator } from './unique-validator.service';

describe('UniqueValidatorService', () => {
  let service: UniqueValidator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UniqueValidator],
    }).compile();

    service = module.get<UniqueValidator>(UniqueValidator);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
