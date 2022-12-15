const METHODS = ["GET", "POST", "PUT", "DELETE"];

class AuthorizerHandler {
  constructor() {
    this.resourceData = {};
    this.orgsData = {};
    this.exp = 0;
  }

  get orgsData() {
    return this._orgsData;
  }
  set orgsData(obj) {
    this._orgsData = obj;
  }

  get resourceData() {
    return this._resourceData;
  }
  set resourceData(obj) {
    this._resourceData = obj;
  }

  get exp() {
    return this._exp;
  }

  set exp(exp) {
    this._exp = exp;
  }

  updateData(dynamoClient) {
    const queryParams = {
      TableName: "AuthNZ",
      FilterExpression: "begins_with (SK, :SK) or begins_with(PK, :PK)",
      ExpressionAttributeValues: { ":SK": "ResourceID#", ":PK": "OrgID#" },
    };
    return new Promise((resolve, reject) => {
      if (
        Object.keys(this._resourceData).length !== 0 &&
        Date.now() < this._exp
      ) {
        console.log("Cached");
        return resolve();
      }

      console.log(45, this.resourceData);

      dynamoClient.scan(queryParams, (err, data) => {
        if (err) reject(err);
        else {
          console.log(data.Items);
          // console.log(data);
          data.Items.filter(({ PK }) => PK[0] === "A").forEach((item) => {
            const { SK, PK } = item;
            const AppID = PK.replace("AppID#", "");
            const [ResourceID, GroupID] = SK.replace("GroupID#", "")
              .replace("ResourceID#", "")
              .split(":");

            // console.log(GroupID, ResourceID);
            if (!this._resourceData[AppID]) this._resourceData[AppID] = {};
            if (!this._resourceData[AppID][ResourceID])
              this._resourceData[AppID][ResourceID] = {};
            if (!this._resourceData[AppID][ResourceID][GroupID])
              this._resourceData[AppID][ResourceID][GroupID] = {};
            METHODS.forEach((method) => {
              if (typeof item[method] === "boolean")
                this._resourceData[AppID][ResourceID][GroupID][method] =
                  item[method];
            });
          });
          data.Items.filter(({ PK }) => PK[0] === "O").forEach(
            ({ SK, PK, CreatedBy, OrgName }) => {
              const AppID = SK.replace("AppID#", "");
              const OrgID = PK.replace("OrgID#", "");
              if (!(AppID in this._orgsData)) this._orgsData[AppID] = {};
              this._orgsData[AppID][OrgID] = {
                OrgName,
                CreatedBy: CreatedBy.replace("UserID#", ""),
              };
            }
          );
          this._exp = Date.now();
          resolve();
        }
      });
    });
  }
}
exports.AuthorizerHandler = AuthorizerHandler;
