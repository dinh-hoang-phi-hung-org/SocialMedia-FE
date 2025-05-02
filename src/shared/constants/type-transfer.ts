import { LoginRequest, RegisterFormData } from "@/shared/types/common-type/auth-type";
import { TransferType, TypeTransferEntry } from "../types/common-type/shared-types";
import { autherizeService } from "@/app/auth/_services/auth-services";
const createAuthTypeTransferEntry = (entry: TypeTransferEntry): TransferType => {
  return {
    repository: entry.repository,
    otherAPIs: {
      login: (loginRequest: LoginRequest) => entry.repository.login(loginRequest),
      register: (data: RegisterFormData) => entry.repository.register(data),
      refreshToken: (refreshToken: string) => entry.repository.refreshToken(refreshToken),
      getCurrentUser: () => entry.repository.getCurrentUser(),
      logout: () => entry.repository.logout(),
      verifyEmail: (token: string) => entry.repository.verifyEmail(token),
    },
  };
};

export const TypeTransfer: Record<string, TransferType> = {
  Auth: createAuthTypeTransferEntry({
    repository: autherizeService,
  } as TypeTransferEntry),
};
