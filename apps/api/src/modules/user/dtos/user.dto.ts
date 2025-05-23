import { AddressDto } from "@/modules/address/dtos/address.dto";
import { User } from "../models/user.entity";

export class UserDto {
    name: string;
    email: string;
    phone: string;
    role: User['role'];
    cpf: string;
    address: AddressDto;
}