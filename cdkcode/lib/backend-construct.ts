/* En este construct se crearán todos los recursos asociados al backend de la aplicación */

import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct,  } from 'constructs';
import * as path from 'path';
import { CfnOutput } from 'aws-cdk-lib';
import * as iam from "aws-cdk-lib/aws-iam";
import * as apigw from 'aws-cdk-lib/aws-apigateway';

export class BackendConstruct extends Construct {
  public readonly api: apigw.RestApi; 

  constructor(scope: Construct, id: string) {
    super(scope, id);

    
    // Creamos un rol para asignarlo a la función lambda
    const lambdaRole = new iam.Role(this, "lambda-invoke-role-id", {
        assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
        roleName: "Lambda-Backend-Role",
        description: "Rol de IAM para que las funciones lambda puedan ejecutarse.",
      });
  

      // Añademos un Managed Policy al rol de IAM
      lambdaRole.addManagedPolicy(
        iam.ManagedPolicy.fromAwsManagedPolicyName(
            'service-role/AWSLambdaBasicExecutionRole', // from the arn after policy
          )
      );

    // Se define una función Lambda 
    const squareLambda = new lambda.Function(this, 'backend-square-lambda', {
        runtime: lambda.Runtime.PYTHON_3_9,
        handler: 'function.handler',
        functionName: "backend-square-lambda",
        code: lambda.Code.fromAsset(path.join(__dirname, "/../../assets/backend/square")), // frombucket requires zip file
        role: lambdaRole,
      });

    // Se crea un api gateway que recibirá las peticiones al backend
    this.api = new apigw.RestApi(this, "RestApi", {
      deploy: true
    });
    
    this.api.root
        .addResource("api")
        .addResource("{number}")
        .addMethod("GET", new apigw.LambdaIntegration(squareLambda));
    
    new CfnOutput(this, "ApiUrl", { value: this.api.url });
 
  }
}