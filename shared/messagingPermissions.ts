export type UserRole = 
  | "admin"
  | "billing"
  | "operation"
  | "marketing"
  | "support"
  | "property_owner"
  | "service_provider"
  | "client"
  | "country_manager"
  | "city_manager"
  | "operation_support";

export interface RoleMessagingPermissions {
  [role: string]: UserRole[];
}

export const ROLE_MESSAGING_PERMISSIONS: RoleMessagingPermissions = {
  admin: [
    "admin",
    "billing",
    "operation",
    "marketing",
    "support",
    "country_manager",
    "city_manager",
    "property_owner",
    "service_provider",
    "client",
    "operation_support",
  ],
  billing: [
    "support",
    "country_manager",
    "city_manager",
    "property_owner",
    "service_provider",
    "client",
  ],
  operation: [
    "support",
    "country_manager",
    "city_manager",
    "property_owner",
    "service_provider",
    "client",
  ],
  marketing: [
    "support",
    "country_manager",
    "city_manager",
    "property_owner",
    "service_provider",
    "client",
  ],
  support: [
    "admin",
    "billing",
    "operation",
    "marketing",
    "country_manager",
    "city_manager",
    "property_owner",
    "service_provider",
    "client",
    "operation_support",
  ],
  country_manager: [
    "admin",
    "billing",
    "operation",
    "marketing",
    "support",
    "country_manager",
    "property_owner",
    "service_provider",
  ],
  city_manager: [
    "admin",
    "billing",
    "operation",
    "marketing",
    "support",
    "country_manager",
    "property_owner",
    "client",
  ],
  property_owner: [
    "admin",
    "billing",
    "operation",
    "marketing",
    "support",
    "city_manager",
    "client",
  ],
  service_provider: [
    "admin",
    "billing",
    "operation",
    "marketing",
    "support",
    "country_manager",
    "client",
  ],
  client: [
    "admin",
    "billing",
    "operation",
    "marketing",
    "support",
    "property_owner",
    "service_provider",
  ],
  operation_support: [
    "admin",
    "billing",
    "operation",
    "marketing",
    "support",
    "country_manager",
    "city_manager",
    "property_owner",
    "service_provider",
    "client",
  ],
};

export function getAllowedMessagingRoles(userRole: UserRole): UserRole[] {
  return ROLE_MESSAGING_PERMISSIONS[userRole] || [];
}

export function canMessageRole(senderRole: UserRole, receiverRole: UserRole): boolean {
  const allowedRoles = getAllowedMessagingRoles(senderRole);
  return allowedRoles.includes(receiverRole);
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrator",
  billing: "Billing",
  operation: "Operation",
  marketing: "Marketing",
  support: "Support",
  property_owner: "Property Owner / Host",
  service_provider: "Service Provider",
  client: "Client",
  country_manager: "Country Manager",
  city_manager: "City Manager",
  operation_support: "Operation Support",
};
