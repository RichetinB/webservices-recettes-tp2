	import { Metadata, status } from '@grpc/grpc-js';
import {
  type GrpcOptions,
  RpcException,
  Transport,
} from '@nestjs/microservices';
import { fileURLToPath } from 'node:url';
 
export type GrpcPackage = 'recipe' | 'user';
 
/** The .proto files ship with this package, next to its dist/ folder */
const PROTO_DIR = fileURLToPath(new URL('../proto/', import.meta.url));
 
/** Same options for the server (bind address) and the clients (target address). */
export function grpcOptions(pkg: GrpcPackage, url: string): GrpcOptions {
  return {
    options: {
      loader: {
        arrays: true,
        defaults: true,
        enums: String,
        keepCase: false,
        longs: String,
      },
      package: pkg,
      protoPath: `${PROTO_DIR}${pkg}.proto`,
      url,
    },
    transport: Transport.GRPC,
  };
}
 
/** The gateway authenticates the user, then passes its id along to the services */
export const USER_ID_METADATA = 'x-user-id';
 
/** Gateway side: the metadata to send with every call */
export function userMetadata(userId: string): Metadata {
  const metadata = new Metadata();
  metadata.set(USER_ID_METADATA, userId);
 
  return metadata;
}
 
/** Service side: the caller's id, UNAUTHENTICATED when the gateway sent none */
export function requireUserId(metadata: Metadata): string {
  const [userId] = metadata.get(USER_ID_METADATA);
  if (!userId) throw rpcError(status.UNAUTHENTICATED, 'Missing user identity');
 
  return String(userId);
}
 
/** A gRPC error, with its status code, that the gateway turns into an HTTP error */
export function rpcError(code: status, message: string): RpcException {
  return new RpcException({ code, message });
}