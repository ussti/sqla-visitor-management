import { z } from 'zod';

export const personalInfoSchema = z.object({
  firstName: z
    .string()
    .min(1, 'personalInfo.errors.firstNameRequired')
    .min(2, 'personalInfo.errors.firstNameMinLength'),
  lastName: z
    .string()
    .min(1, 'personalInfo.errors.lastNameRequired')
    .min(2, 'personalInfo.errors.lastNameMinLength'),
});

export const organizationSchema = z.object({
  companyName: z
    .string()
    .min(1, 'organization.errors.companyNameRequired'),
  position: z.string().optional(),
});

export const contactSchema = z.object({
  email: z
    .string()
    .min(1, 'contact.errors.emailRequired')
    .email('contact.errors.emailInvalid'),
});

export const hostSchema = z.object({
  hostId: z
    .string()
    .min(1, 'host.errors.hostRequired'),
  hostName: z.string(),
  hostEmail: z.string().email(),
});

export const photoSchema = z.object({
  photoBlob: z.instanceof(Blob).optional(),
  photoUrl: z.string().optional(),
  biometricConsent: z.boolean().refine(val => val === true, {
    message: 'Biometric consent is required'
  }),
});

export const ndaSchema = z.object({
  signatureBlob: z.instanceof(Blob, {
    message: 'nda.errors.signatureRequired'
  }),
  signatureUrl: z.string().min(1, 'nda.errors.signatureRequired'),
  ndaAccepted: z.boolean().refine(val => val === true, {
    message: 'NDA acceptance is required'
  }),
});

export const completeRegistrationSchema = personalInfoSchema
  .merge(organizationSchema)
  .merge(contactSchema)
  .merge(hostSchema)
  .merge(photoSchema)
  .merge(ndaSchema);

export type PersonalInfo = z.infer<typeof personalInfoSchema>;
export type OrganizationInfo = z.infer<typeof organizationSchema>;
export type ContactInfo = z.infer<typeof contactSchema>;
export type HostInfo = z.infer<typeof hostSchema>;
export type PhotoInfo = z.infer<typeof photoSchema>;
export type NDAInfo = z.infer<typeof ndaSchema>;
export type CompleteRegistration = z.infer<typeof completeRegistrationSchema>;