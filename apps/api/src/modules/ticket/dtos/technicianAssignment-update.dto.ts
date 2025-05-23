import { PartialType } from "@nestjs/swagger";
import { TechnicianAssignmentDto } from "./technicianAssignment.dto";

export class TechnicianAssignmentUpdateDto extends PartialType(TechnicianAssignmentDto) {}