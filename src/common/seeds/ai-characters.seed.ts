import { CreateAICharacterDto } from "../../modules/ai-characters/dto/create-ai-character.dto";

export const aiCharactersSeed: CreateAICharacterDto[] = [
  {
    name: "Marie",
    description: "A friendly French language tutor",
    personality: "Patient and encouraging",
    background: "Native French speaker with experience in teaching",
    languages: ["fr", "en"],
    avatar: "https://example.com/marie.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "John",
    description: "An experienced English teacher",
    personality: "Professional and structured",
    background: "TEFL certified with 10 years of experience",
    languages: ["en", "es"],
    avatar: "https://example.com/john.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
