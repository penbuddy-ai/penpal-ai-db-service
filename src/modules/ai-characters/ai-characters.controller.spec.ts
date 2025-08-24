import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Logger } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

import { AICharactersController } from "./ai-characters.controller";
import { AICharacterService } from "./ai-characters.service";
import { CreateAICharacterDto } from "./dto/create-ai-character.dto";

describe("aICharactersController", () => {
  let controller: AICharactersController;
  let service: jest.Mocked<AICharacterService>;
  let logger: jest.Mocked<Logger>;

  const mockAICharacter = {
    _id: "507f1f77bcf86cd799439011",
    name: "Test Character",
    description: "A test AI character",
    personality: "friendly",
    background: "Test background",
    languages: ["en", "fr"],
    avatar: "avatar-url",
  };

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByName: jest.fn(),
      findByLanguage: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AICharactersController],
      providers: [
        {
          provide: AICharacterService,
          useValue: mockService,
        },
        {
          provide: Logger,
          useValue: mockLogger,
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AICharactersController>(AICharactersController);
    service = module.get<AICharacterService>(AICharacterService) as jest.Mocked<AICharacterService>;
    logger = module.get<Logger>(Logger) as jest.Mocked<Logger>;

    // Replace controller's logger with our mock
    Object.defineProperty(controller, "logger", {
      value: logger,
      writable: true,
    });
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("should create an AI character", async () => {
      const createDto: CreateAICharacterDto = {
        name: "Test Character",
        description: "A test AI character",
        personality: "friendly",
        background: "Test background",
        languages: ["en", "fr"],
      };

      service.create.mockResolvedValue(mockAICharacter as any);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockAICharacter);
      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(logger.log).toHaveBeenCalledWith(`Creating new AI character with name: ${createDto.name}`);
    });
  });

  describe("findAll", () => {
    it("should return all AI characters", async () => {
      const mockCharacters = [mockAICharacter];
      service.findAll.mockResolvedValue(mockCharacters as any);

      const result = await controller.findAll();

      expect(result).toEqual(mockCharacters);
      expect(service.findAll).toHaveBeenCalled();
      expect(logger.log).toHaveBeenCalledWith("Retrieving all AI characters");
    });
  });

  describe("findOne", () => {
    it("should return an AI character by id", async () => {
      const id = "507f1f77bcf86cd799439011";
      service.findOne.mockResolvedValue(mockAICharacter as any);

      const result = await controller.findOne(id);

      expect(result).toEqual(mockAICharacter);
      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(logger.log).toHaveBeenCalledWith(`Retrieving AI character with ID: ${id}`);
    });
  });

  describe("findByLanguage", () => {
    it("should return AI characters by language", async () => {
      const languageCode = "en";
      const mockCharacters = [mockAICharacter];
      service.findByLanguage.mockResolvedValue(mockCharacters as any);

      const result = await controller.findByLanguage(languageCode);

      expect(result).toEqual(mockCharacters);
      expect(service.findByLanguage).toHaveBeenCalledWith(languageCode);
      expect(logger.log).toHaveBeenCalledWith(`Finding AI characters for language code: ${languageCode}`);
    });
  });

  describe("update", () => {
    it("should update an AI character", async () => {
      const id = "507f1f77bcf86cd799439011";
      const updateDto = { description: "Updated description" };
      const updatedCharacter = { ...mockAICharacter, description: "Updated description" };

      service.update.mockResolvedValue(updatedCharacter as any);

      const result = await controller.update(id, updateDto);

      expect(result).toEqual(updatedCharacter);
      expect(service.update).toHaveBeenCalledWith(id, updateDto);
      expect(logger.log).toHaveBeenCalledWith(`Updating AI character with ID: ${id}`);
    });
  });

  describe("remove", () => {
    it("should delete an AI character", async () => {
      const id = "507f1f77bcf86cd799439011";
      service.remove.mockResolvedValue(mockAICharacter as any);

      const result = await controller.remove(id);

      expect(result).toBeUndefined(); // Controller returns void
      expect(service.remove).toHaveBeenCalledWith(id);
      expect(logger.log).toHaveBeenCalledWith(`Deleting AI character with ID: ${id}`);
    });
  });
});
