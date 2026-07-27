import { prisma } from "./src/utils/db";
async function test() {
  try {
    const user = await prisma.user.findUnique({ where: { email: "test@test.com" } });
    console.log("Success:", user);
  } catch (e) {
    console.error("DB Error:", e);
  }
}
test();
