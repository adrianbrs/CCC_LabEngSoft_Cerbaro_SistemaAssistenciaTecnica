import { AddressDto } from "@/modules/address/dtos/address.dto";
import { UserRole } from "@musat/core";

export class UserDto {
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    cpf: string;
    address: AddressDto;
}