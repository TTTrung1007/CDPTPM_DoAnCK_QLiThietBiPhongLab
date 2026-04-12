const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  target_collection: { type: String, required: true },
  target_id: { type: mongoose.Schema.Types.ObjectId },
  details: { type: String },
  ip_address: { type: String }
}, { timestamps: true });

auditLogSchema.statics.log = async function(adminId, action, targetCollection, targetId, details) {
  return this.create({
    admin_id: adminId,
    action,
    target_collection: targetCollection,
    target_id: targetId,
    details: typeof details === 'string' ? details : JSON.stringify(details)
  });
};

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
module.exports = AuditLog;
