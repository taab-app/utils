/* eslint-disable import/no-unresolved */
// @ts-expect-error cannot resolve bun sqlite
import { Database } from "bun:sqlite";
import { useCallback } from "react";
import path from "node:path";
import os from "node:os";
import hash from "object-hash";
import { copyFile, mkdir } from "node:fs/promises";
import { usePromise } from "./usePromise";

type UseSQLPropsOptions = { copyDb?: boolean };
type UseSQLProps = { databasePath: string; sqlQuery: string; options: UseSQLPropsOptions };

export const useSQL = (props: UseSQLProps) => {
  const fetch = useCallback(async ({ databasePath, sqlQuery, options }: UseSQLProps) => {
    try {
      let dbPath = databasePath;

      if (options.copyDb) {
        const tempFolder = path.join(os.tmpdir(), "useSQL", hash(databasePath));
        await mkdir(tempFolder, { recursive: true });
        dbPath = path.join(tempFolder, "db.db");
        await copyFile(databasePath, dbPath);
      }

      const db = new Database(dbPath);
      const query = db.query(sqlQuery);
      const result = query.all();

      query.finalize();

      return result;
    } catch (err) {
      console.log(err);
    }
  }, []);

  return usePromise(fetch, [props]);
};
