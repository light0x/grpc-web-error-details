// grpc-web requires XMLHttpRequest
((global as unknown) as any)["XMLHttpRequest"] = require("xhr2");

import { Code } from "../../lib/code_pb";
import * as errorDetails from "../..";
import {
  SampleServiceClient,
  SampleServicePromiseClient,
} from "./lib/sample_grpc_web_pb";
import { ErrorRequest, HelloReply, HelloRequest } from "./lib/sample_pb";

const grpc_web_server = "http://localhost:9090";
const client = new SampleServicePromiseClient(grpc_web_server);
const cbclient = new SampleServiceClient(grpc_web_server);

(async () => {
  // Normal Response
  {
    const req = new HelloRequest();
    req.setName("world");
    try {
      const res: HelloReply = await client.sayHello(req);
      console.log(res.toObject());
    } catch (e) {
      console.log("Error: ", e);
      const [st, details] = errorDetails.statusFromError(e);
      if (st) {
        console.log("Status: code = ", st.getCode());
      } else {
        console.warn("Unknown error: ", e);
      }
    }
  }
  // callback client
  {
    const req = new ErrorRequest();
    req.setCode(Code.FAILED_PRECONDITION);
    cbclient.sayError(req, {}, (err, res) => {
      console.log("Received response from callback sayError");
      if (!err) {
        // RPC Success
        return;
      }
      const [st, details] = errorDetails.statusFromError(err);
      // handle richer error with status and details
      if (st && details) {
        console.log(
          `Created Status: code = ${st.getCode()}, message = "${st.getMessage()}"`
        );
        for (const [i, d] of details.entries()) {
          console.log();
          console.log(`call back error Details #${i + 1} is...`);
          if (d instanceof errorDetails.DebugInfo) {
            console.log(
              `DebugInfo: StackEntries = [${d
                .getStackEntriesList()
                .join(", ")}], Detail = "${d.getDetail()}"`
            );
          } else if (d instanceof errorDetails.LocalizedMessage) {
            console.log(
              `LocalizedMessage: Locale = ${d.getLocale()}, Message = ${d.getMessage()}`
            );
          } else {
            console.log("Unknown. Moving on to the next detail...");
          }
        }
      }
    });
  }
  // Error Response
  {
    const req = new ErrorRequest();
    req.setCode(Code.FAILED_PRECONDITION);
    try {
      const res: HelloReply = await client.sayError(req);
      // the promise will reject and it will not be called
      console.log("Received response from sayError", res.toObject());
    } catch (e) {
      console.log(
        "Received error from sayError, calling `statusFromError`...\n"
      );
      const [st, details] = errorDetails.statusFromError(e);
      if (st && details) {
        console.log(
          `Created Status: code = ${st.getCode()}, message = "${st.getMessage()}"`
        );
        for (const [i, d] of details.entries()) {
          console.log();
          console.log(`Details #${i + 1} is...`);
          if (d instanceof errorDetails.DebugInfo) {
            console.log(
              `DebugInfo: StackEntries = [${d
                .getStackEntriesList()
                .join(", ")}], Detail = "${d.getDetail()}"`
            );
          } else if (d instanceof errorDetails.QuotaFailure) {
            console.log("PreconditionFailure");
            console.group();
            for (const [j, v] of d.getViolationsList().entries()) {
              console.log(`PreconditionFailureViolation #${j}`);
              console.group();
              console.log(`Subject: ${v.getSubject()}`);
              console.log(`Description: ${v.getDescription()}`);
              console.groupEnd();
            }
            console.groupEnd();
          } else if (d instanceof errorDetails.ErrorInfo) {
            console.log(
              `ErrorInfo: Domain = ${d.getDomain()}, Reason = ${d.getReason()}, Metadata = ${JSON.stringify(
                d.getMetadataMap().toObject()
              )}`
            );
          } else if (d instanceof errorDetails.PreconditionFailure) {
            console.log(`PreconditionFailure`);
            console.group();
            for (const [j, v] of d.getViolationsList().entries()) {
              console.log(`PreconditionFailureViolation #${j + 1}`);
              console.group();
              console.log(`Type: ${v.getType()}`);
              console.log(`Subject: ${v.getSubject()}`);
              console.log(`Description: ${v.getDescription()}`);
              console.groupEnd();
            }
            console.groupEnd();
          } else if (d instanceof errorDetails.BadRequest) {
            console.log(`BadRequest`);
            console.group();
            for (const [j, v] of d.getFieldViolationsList().entries()) {
              console.log(`PreconditionFailureViolation #${j + 1}`);
              console.group();
              console.log(`Field: ${v.getField()}`);
              console.log(`Description: ${v.getDescription()}`);
              console.groupEnd();
            }
            console.groupEnd();
          } else if (d instanceof errorDetails.RequestInfo) {
            console.log(
              `RequestInfo: RequestId = ${d.getRequestId()}, ServingData = ${d.getServingData()}`
            );
          } else if (d instanceof errorDetails.ResourceInfo) {
            console.log(
              `RequestInfo: ResourceType = ${d.getResourceType()}, ResourceName = ${d.getResourceName()}, Owner = ${d.getOwner()}, Description = ${d.getDescription()}`
            );
          } else if (d instanceof errorDetails.Help) {
            console.log(`Help`);
            console.group();
            for (const [j, v] of d.getLinksList().entries()) {
              console.log(`HelpLink #${j + 1}`);
              console.group();
              console.log(`Description: ${v.getDescription()}`);
              console.log(`Url: ${v.getUrl()}`);
              console.groupEnd();
            }
            console.groupEnd();
          } else if (d instanceof errorDetails.LocalizedMessage) {
            console.log(
              `LocalizedMessage: Locale = ${d.getLocale()}, Message = ${d.getMessage()}`
            );
          } else {
            console.log("Unknown. Moving on to the next detail...");
          }
        }
        console.groupEnd();
      } else {
        console.warn("Unknown error: ", e);
      }
    }
  }
})();
