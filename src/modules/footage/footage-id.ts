import { z } from "zod";

/** Canonical runtime validation for Footage identifiers across module boundaries. */
export const footageIdSchema = z.uuid();
