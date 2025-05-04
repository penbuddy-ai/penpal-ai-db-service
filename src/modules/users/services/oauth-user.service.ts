import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { LanguagesService } from "../../languages/languages.service";
import { OAuthUserDto } from "../dto/oauth-user.dto";
import { User, UserDocument } from "../schemas/user.schema";

@Injectable()
export class OAuthUserService {
  private readonly logger = new Logger(OAuthUserService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private languagesService: LanguagesService,
  ) {}

  async createOrUpdateOAuthUser(oauthUserDto: OAuthUserDto): Promise<UserDocument> {
    const { profile } = oauthUserDto;

    try {
      let user = await this.userModel.findOne({
        "oauthProfiles.provider": profile.provider,
        "oauthProfiles.providerId": profile.providerId,
      });

      if (!user) {
        user = await this.userModel.findOne({ email: profile.email });
      }

      const languageRefs = await this.processLanguageReferences(oauthUserDto);

      if (user) {
        this.logger.log(`Updating existing user with OAuth profile: ${profile.email}`);

        const existingProfileIndex = user.oauthProfiles.findIndex(
          p => p.provider === profile.provider && p.providerId === profile.providerId,
        );

        if (existingProfileIndex !== -1) {
          user.oauthProfiles[existingProfileIndex] = {
            ...user.oauthProfiles[existingProfileIndex],
            ...profile,
          };
        }
        else {
          user.oauthProfiles.push(profile);
        }

        if (languageRefs.nativeLanguage && !user.nativeLanguage) {
          user.nativeLanguage = languageRefs.nativeLanguage;
        }

        if (languageRefs.learningLanguages?.length) {
          const existingIds = user.learningLanguages.map(lang => lang.toString());
          const newLanguages = languageRefs.learningLanguages.filter(
            lang => !existingIds.includes(lang.toString()),
          );

          user.learningLanguages = [...user.learningLanguages, ...newLanguages];
        }

        if (!user.firstName && oauthUserDto.firstName) {
          user.firstName = oauthUserDto.firstName;
        }
        else if (!user.firstName && profile.displayName) {
          const nameParts = profile.displayName.split(" ");
          user.firstName = nameParts[0] || "User";
        }

        if (!user.lastName && oauthUserDto.lastName) {
          user.lastName = oauthUserDto.lastName;
        }
        else if (!user.lastName && profile.displayName) {
          const nameParts = profile.displayName.split(" ");
          user.lastName = nameParts.slice(1).join(" ") || `${profile.provider.charAt(0).toUpperCase() + profile.provider.slice(1)}User`;
        }

        user.isVerified = true;
        user.lastLogin = new Date();
        user.authMethod = profile.provider;

        return user.save();
      }
      else {
        this.logger.log(`Creating new user from OAuth profile: ${profile.email}`);

        let firstName = oauthUserDto.firstName || "User";
        let lastName = oauthUserDto.lastName || `${profile.provider.charAt(0).toUpperCase() + profile.provider.slice(1)}User`;

        if (!oauthUserDto.firstName && !oauthUserDto.lastName && profile.displayName) {
          const nameParts = profile.displayName.split(" ");
          firstName = nameParts[0];
          lastName = nameParts.slice(1).join(" ") || lastName;
        }

        const newUser = new this.userModel({
          email: profile.email,
          firstName,
          lastName,
          profilePicture: profile.photoURL,
          isActive: true,
          isVerified: true,
          status: "active",
          oauthProfiles: [profile],
          authMethod: profile.provider,
          lastLogin: new Date(),
          ...languageRefs,
        });

        return newUser.save();
      }
    }
    catch (error) {
      this.logger.error(`Error creating/updating OAuth user: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findByOAuth(provider: string, providerId: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({
      "oauthProfiles.provider": provider,
      "oauthProfiles.providerId": providerId,
    });

    if (!user) {
      throw new NotFoundException(`No user found with ${provider} profile ID: ${providerId}`);
    }

    return user;
  }

  private async processLanguageReferences(oauthUserDto: OAuthUserDto) {
    const result: any = {};

    if (oauthUserDto.nativeLanguageCode) {
      try {
        const nativeLanguage = await this.languagesService.findByCode(oauthUserDto.nativeLanguageCode);
        if (nativeLanguage) {
          result.nativeLanguage = nativeLanguage.id;
        }
      }
      catch (error) {
        this.logger.warn(`Native language not found: ${oauthUserDto.nativeLanguageCode}`, error);
      }
    }

    if (oauthUserDto.learningLanguageCodes?.length) {
      result.learningLanguages = [];

      for (const code of oauthUserDto.learningLanguageCodes) {
        try {
          const language = await this.languagesService.findByCode(code);
          if (language) {
            result.learningLanguages.push(language.id);
          }
        }
        catch (error) {
          this.logger.warn(`Learning language not found: ${code}`, error);
        }
      }
    }

    return result;
  }
}
