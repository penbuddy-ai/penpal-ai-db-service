import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { ServiceAuthGuard } from "../../../common/guards/service-auth.guard";
import { OAuthUserDto } from "../dto/oauth-user.dto";
import { User, UserDocument } from "../schemas/user.schema";
import { OAuthUserService } from "../services/oauth-user.service";
import { UserService } from "../users.service";

// DTO pour la mise à jour de souscription
class UpdateSubscriptionDto {
  plan: string;
  status: string;
  trialEnd?: Date;
}

@ApiTags("users")
@Controller("users")
@UseGuards(ServiceAuthGuard)
@ApiHeader({
  name: "x-api-key",
  description: "Clé API pour l'authentification inter-services",
  required: true,
})
@ApiHeader({
  name: "x-service-name",
  description: "Nom du service appelant (ex: auth-service)",
  required: true,
})
export class InternalUsersController {
  private readonly logger = new Logger(InternalUsersController.name);

  constructor(
    private readonly userService: UserService,
    private readonly oauthUserService: OAuthUserService,
  ) {}

  @Post("oauth")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Créer ou mettre à jour un utilisateur à partir des infos OAuth",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Utilisateur créé/mis à jour avec succès",
    type: User,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Données OAuth invalides",
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: "Erreur serveur",
  })
  @ApiBody({ type: OAuthUserDto })
  async createOrUpdateOAuthUser(
    @Body() oauthUserDto: OAuthUserDto,
  ): Promise<UserDocument> {
    this.logger.log(
      `Received OAuth user data for provider: ${oauthUserDto.profile.provider}`,
    );
    return this.oauthUserService.createOrUpdateOAuthUser(oauthUserDto);
  }

  @Get("oauth/:provider/:providerId")
  @ApiOperation({
    summary: "Récupérer un utilisateur par ses identifiants OAuth",
  })
  @ApiParam({
    name: "provider",
    description: "Fournisseur OAuth (google, facebook, etc.)",
  })
  @ApiParam({
    name: "providerId",
    description: "ID utilisateur dans le système du fournisseur",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Utilisateur trouvé",
    type: User,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Utilisateur non trouvé",
  })
  async findByOAuth(
    @Param("provider") provider: string,
    @Param("providerId") providerId: string,
  ): Promise<UserDocument> {
    this.logger.log(
      `Lookup for OAuth user with provider: ${provider} and ID: ${providerId}`,
    );
    return this.oauthUserService.findByOAuth(provider, providerId);
  }

  @Get("email/:email")
  @ApiOperation({ summary: "Vérifier si un email existe déjà" })
  @ApiParam({ name: "email", description: "Adresse email à vérifier" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Email trouvé",
    type: User,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Email non trouvé",
  })
  async findByEmail(
    @Param("email") email: string,
  ): Promise<UserDocument | null> {
    this.logger.log(`Checking if email exists: ${email}`);
    return this.userService.findByEmail(email);
  }

  @Put(":userId/subscription")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Mettre à jour les informations de souscription d'un utilisateur",
  })
  @ApiParam({ name: "userId", description: "ID de l'utilisateur" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Souscription mise à jour avec succès",
    type: User,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Utilisateur non trouvé",
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: "Erreur serveur",
  })
  @ApiBody({ type: UpdateSubscriptionDto })
  async updateSubscription(
    @Param("userId") userId: string,
    @Body() subscriptionData: UpdateSubscriptionDto,
  ): Promise<UserDocument> {
    this.logger.log(
      `Updating subscription for user ${userId}: ${subscriptionData.plan} (${subscriptionData.status})`,
    );
    return this.userService.updateSubscription(userId, subscriptionData);
  }
}
