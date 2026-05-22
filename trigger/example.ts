import { logger, task, wait } from "@trigger.dev/sdk";

export const helloWorldTask = task({
  id: "hello-world",
  run: async (payload: string) => {
    logger.log("Hello, world!", { payload });

    await wait.for({ seconds: 5 });

    return {
      message: `Hello, ${payload}!`,
    };
  },
});
