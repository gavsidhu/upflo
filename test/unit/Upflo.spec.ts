import { DataSourceOptions } from "typeorm";
import { Upflo } from "../../src/services/Upflo";
import { MailgunProvider } from "../../src/services/Email/Providers/MailgunProvider";
import { mock, MockProxy } from "jest-mock-extended";

describe("Upflo", () => {
  let options: DataSourceOptions;
  let emailProvider: MailgunProvider;
  let upflo: Upflo;

  beforeAll(() => {
    options = mock<DataSourceOptions>({ type: "sqlite", database: "mydb.sql" });
    emailProvider = mock<MailgunProvider>();
    upflo = new Upflo(options, emailProvider);
  });

  afterAll(() => {
    const cronJob = upflo.workflows.getCronJob();
    cronJob.stop();
  });

  it("should emit and handle events", () => {
    const eventHandler = jest.fn();

    upflo.on("contact.created", eventHandler);

    upflo.emit("contact.created", "data");

    expect(eventHandler).toHaveBeenCalled();
    expect(eventHandler).toHaveBeenCalledWith("data");
  });

  it("should handle multiple events", () => {
    const eventHandler1 = jest.fn();
    const eventHandler2 = jest.fn();

    upflo.on("contact.created", eventHandler1);
    upflo.on("contact.lists.contact_added", eventHandler2);

    upflo.emit("contact.created", "data for event 1");
    upflo.emit("contact.lists.contact_added", "data for event 2");

    expect(eventHandler1).toHaveBeenCalled();
    expect(eventHandler1).toHaveBeenCalledWith("data for event 1");
    expect(eventHandler2).toHaveBeenCalled();
    expect(eventHandler2).toHaveBeenCalledWith("data for event 2");
  });
});
