import database from "infra/database.js";

async function status(request, response) {
  const updatedAt = new Date().toISOString(),
    databaseVersionResult = await database.query("SHOW server_version;"),
    databaseVersionValue = databaseVersionResult.rows[0].server_version,
    databaseMaxConnectionsResult = await database.query(
      "SHOW max_connections;",
    ),
    databaseMaxConnectionsValue =
      databaseMaxConnectionsResult.rows[0].max_connections,
    databaseName = process.env.POSTGRES_DB,
    databaseOpenedConnectionsResult = await database.query({
      text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
      values: [databaseName],
    }),
    databaseOpenedConnectionsValue =
      databaseOpenedConnectionsResult.rows[0].count;

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: databaseVersionValue,
        max_connections: parseInt(databaseMaxConnectionsValue),
        opened_connections: databaseOpenedConnectionsValue,
      },
    },
  });
}

export default status;
