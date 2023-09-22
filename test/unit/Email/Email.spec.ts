import { DataSource } from "typeorm";
import { Email } from "../../../src/services/Email/Email";

describe("Email Class", () => {
  let mockDataSource: DataSource;
  let mockEmailProvider: any;

  beforeEach(() => {
    mockDataSource = {} as DataSource;
    mockEmailProvider = { sendEmail: jest.fn() };
  });

  it("should send email", async () => {
    const email = "test@email.com";
    const subject = "Test Subject";
    const body = "Test Body";

    const emailInstance = new Email(mockDataSource, mockEmailProvider);
    await emailInstance.sendEmail(email, subject, body);

    expect(mockEmailProvider.sendEmail).toHaveBeenCalledWith(
      email,
      subject,
      body
    );
  });
});
