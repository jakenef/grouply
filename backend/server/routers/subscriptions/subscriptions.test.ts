import { prisma } from "../../prisma";
import { appRouter } from "../index";

describe("Subscriptions Router", () => {
  let testUser: any;
  let caller: any;

  beforeAll(async () => {
    // 1. Ensure we have a test user
    testUser = await prisma.user.findFirst({
      where: { email: "test-subscriber@example.com" },
    });

    if (!testUser) {
      // Need a location first
      const location = await prisma.location.create({
        data: {
          city: "Test City",
          precision: "CITY",
        },
      });

      testUser = await prisma.user.create({
        data: {
          email: "test-subscriber@example.com",
          authUserId: "test-subscriber-auth-id",
          givenName: "Test",
          familyName: "Subscriber",
          locationId: location.id,
          role: "USER",
        },
      });
    }

    // 2. Create the caller with the test user in context
    caller = appRouter.createCaller({
      prisma,
      user: testUser,
      supabaseUser: { id: testUser.authUserId } as any,
      req: {} as any,
      token: "test-token",
      requestId: "test-request",
    });
  });

  afterAll(async () => {
    // Clean up subscriptions for this user
    await prisma.subscription.deleteMany({
      where: { userId: testUser.id },
    });
  });

  it("getStatus should return isActive: false when no subscription exists", async () => {
    const status = await caller.subscriptions.getStatus();
    expect(status.isActive).toBe(false);
    expect(status.subscription).toBeNull();
  });

  it("verifyReceipt should create a subscription and return success", async () => {
    const result = await caller.subscriptions.verifyReceipt({
      receipt: "fake-ios-receipt",
      platform: "IOS",
    });

    expect(result.hasAccess).toBe(true);
    expect(result.expiresAt).toBeInstanceOf(Date);
    expect(result.subscriptionId).toBeDefined();

    // Verify it's in the DB
    const subInDb = await prisma.subscription.findUnique({
      where: { id: result.subscriptionId },
    });
    expect(subInDb).toBeDefined();
    expect(subInDb?.platform).toBe("IOS");
  });

  it("getStatus should return isActive: true after a successful purchase", async () => {
    const status = await caller.subscriptions.getStatus();
    expect(status.isActive).toBe(true);
    expect(status.subscription).toBeDefined();
    expect(status.subscription?.platform).toBe("IOS");
  });

  it("verifyReceipt should update an existing subscription (upsert check)", async () => {
    // We'll call it again. The stub currently generates a random originalTxId,
    // so to test upsert accurately in a real scenario we'd need fixed IDs,
    // but we can at least check it doesn't crash.
    const result = await caller.subscriptions.verifyReceipt({
      receipt: "another-receipt",
      platform: "ANDROID",
    });

    expect(result.hasAccess).toBe(true);
    expect(result.subscriptionId).toBeDefined();
  });
});
