import { CollaboratorService } from "./collaborator.service";
import { CreateCollaboratorDto } from "./dtos/create-collaborator.dto";
import { Collaborator } from "./collaborator.entity";
import { Body, Controller, Post } from "@nestjs/common";

@Controller('collaborator')
export class CollaboratorController{
    constructor(
        private readonly collaboratorService: CollaboratorService,
    ) {}


    @Post("create")
    async createCollaborator(
        @Body() dto: CreateCollaboratorDto,
    ): Promise<Collaborator> {
        return this.collaboratorService.createCollaborator(dto);
    }
}