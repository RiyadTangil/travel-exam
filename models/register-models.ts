/**
 * Static model registry — import this once at connection time.
 *
 * Using static imports (instead of dynamic require) lets Next.js / Webpack
 * reliably include every model in the bundle and avoids the
 * "Critical dependency: the request of a dependency is an expression" warning
 * that dynamic require(path) can produce.
 *
 * Each model file must use the pattern:
 *   export default mongoose.models.Foo || mongoose.model("Foo", FooSchema)
 * so that Next.js hot-reload does not re-register an already-registered model.
 */

import "@/models/user"
import "@/models/company"
import "@/models/govt-reg-agency"
import "@/models/MarketingCampaign"
import "@/models/AgencyCommunication"
import "@/models/CompanyCommunication"
import "@/models/question-category"
import "@/models/question"
