import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import { GoogleProvider } from "@cdktf/provider-google/lib/provider";
import { ContainerCluster } from "@cdktf/provider-google/lib/container-cluster";
import { SqlDatabase } from "@cdktf/provider-google/lib/sql-database";
import { SqlDatabaseInstance } from "@cdktf/provider-google/lib/sql-database-instance";
import { ArtifactRegistryRepository } from "@cdktf/provider-google/lib/artifact-registry-repository";

const project = "sisu-tech-poc"
const dc = "europe-north1"

class InfraStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    
    new GoogleProvider(this, "google", {
      zone: dc,
      project,
    });

    new ArtifactRegistryRepository(this, "registry", {
      repositoryId: "registry",
      format: "DOCKER",
      location: dc,
    });

    new ContainerCluster(this, "cluster", {
      name: "cluster",
      deletionProtection: false,
      initialNodeCount: 1
    });

    const dbInstance = new SqlDatabaseInstance(this, "database-instance", {
      name: "database",
      databaseVersion: "MYSQL_8_0",
      deletionProtection: false,
      region: dc,
      settings: {
        tier: "db-f1-micro",
        edition: "ENTERPRISE",
      }
    });
  
    new SqlDatabase(this, "database", {
      name: "database",
      instance: dbInstance.id
    });
  }
}

const app = new App();
new InfraStack(app, "infra");
app.synth();
