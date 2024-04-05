import requestV0 from '../v0/request.ts'

/**
 * Metadata Request (Version: 2) => [topics]
 *   topics => STRING
 */

export default ({
 topics
}: any) => Object.assign(requestV0({ topics }), { apiVersion: 2 })
