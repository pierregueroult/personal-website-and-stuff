import { createTransport, type Transporter } from "nodemailer";
import SMTPConnection from "nodemailer/lib/smtp-connection";

export type SMTPConfiguration = { options: SMTPConnection.Options, from: string };

export class MailerPackage {
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor(config: SMTPConfiguration) {
    this.transporter = createTransport(config.options);
    this.from = config.from;
  }
}
