import { MailgunProvider } from "../../../../src/services/Email/Providers";
import { MailgunProviderConfig } from "../../../../types/Email";

jest.mock("mailgun.js", () => {
  return jest.fn().mockImplementation(() => {
    return { client: () => ({ messages: { create: jest.fn() } }) };
  });
});

describe("MailgunProvider Class", () => {
  let config: MailgunProviderConfig & { domain: string };
  let provider: any;

  beforeEach(() => {
    config = {
      domain: "fake-domain",
      key: "fake-api-key",
      username: "api",
    };
    provider = new MailgunProvider(config);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should correctly send email and return response", async () => {
    const expectedResponse = { id: "id", message: "Queued. Thank you." };
    const messageData = {
      to: "test@example.com",
      from: `test@${config.domain}`,
      subject: "subject",
      text: "body",
    };

    provider.mailgunClient.messages.create = jest
      .fn()
      .mockResolvedValue(expectedResponse);

    const response = await provider.sendEmail(
      "test@example.com",
      "subject",
      "body"
    );

    expect(provider.mailgunClient.messages.create).toHaveBeenCalledWith(
      config.domain,
      messageData
    );
    expect(response).toEqual(expectedResponse);
  });
});
