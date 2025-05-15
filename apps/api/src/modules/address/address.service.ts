import { Injectable } from '@nestjs/common';
import { CepInfo } from './models/cep-info.entity';
import { $fetch } from 'ofetch';
import { Config } from '@/constants/config';
import uri from 'uri-tag';

@Injectable()
export class AddressService {
  private readonly bapi = $fetch.create({
    baseURL: Config.api.brasil.baseURL,
  });

  async getCepInfo(cep: string): Promise<CepInfo> {
    return this.bapi(uri`/api/cep/v2/${cep}`).then((res) =>
      CepInfo.create(res as Partial<CepInfo>),
    );
  }
}
