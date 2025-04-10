import { IsBoolean, IsNotEmpty, IsNumber, IsString, Max, Min } from "class-validator";

export class CreateLanguageDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  nativeName: string;

  @IsString()
  flag: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  difficulty: number;

  @IsBoolean()
  isActive: boolean;
}

export class UpdateLanguageDto {
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsString()
  @IsNotEmpty()
  nativeName?: string;

  @IsString()
  flag?: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  difficulty?: number;

  @IsBoolean()
  isActive?: boolean;
}
