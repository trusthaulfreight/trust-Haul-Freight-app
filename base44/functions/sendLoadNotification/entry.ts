import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { event, data, old_data } = body;

    const entityName = event?.entity_name;
    const eventType = event?.type;

    // --- LOAD status changes ---
    if (entityName === 'Load' && eventType === 'update') {
      const load = data;
      const oldStatus = old_data?.status;
      const newStatus = load?.status;

      if (!load || oldStatus === newStatus) return Response.json({ skipped: true });

      // Notify shipper when driver is assigned
      if (newStatus === 'assigned' && load.shipper_user_id) {
        const users = await base44.asServiceRole.entities.User.filter({ id: load.shipper_user_id });
        const shipper = users[0];
        if (shipper?.email) {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: shipper.email,
            subject: `✅ Driver Assigned to "${load.title}"`,
            body: `Hi ${shipper.full_name || 'there'},\n\nA driver has been assigned to your load "${load.title}" (${load.pickup_city}, ${load.pickup_state} → ${load.delivery_city}, ${load.delivery_state}).\n\nLog in to TrustHaul to view details and track your shipment.\n\n— TrustHaul Team`,
          });
          console.log(`[INFO] Notified shipper ${shipper.email} of driver assignment`);
        }
      }

      // Notify driver when load is in_transit
      if (newStatus === 'in_transit' && load.assigned_driver_user_id) {
        const users = await base44.asServiceRole.entities.User.filter({ id: load.assigned_driver_user_id });
        const driver = users[0];
        if (driver?.email) {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: driver.email,
            subject: `🚛 Load Pickup Confirmed: "${load.title}"`,
            body: `Hi ${driver.full_name || 'there'},\n\nPickup has been confirmed for load "${load.title}". You're now marked as in transit.\n\nDeliver to: ${load.delivery_city}, ${load.delivery_state}\n\n— TrustHaul Team`,
          });
          console.log(`[INFO] Notified driver ${driver.email} of in_transit status`);
        }
      }

      // Notify shipper when delivered
      if (newStatus === 'delivered' && load.shipper_user_id) {
        const users = await base44.asServiceRole.entities.User.filter({ id: load.shipper_user_id });
        const shipper = users[0];
        if (shipper?.email) {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: shipper.email,
            subject: `📦 Load Delivered: "${load.title}"`,
            body: `Hi ${shipper.full_name || 'there'},\n\nYour load "${load.title}" has been successfully delivered!\n\nPlease log in to TrustHaul to leave a review for your driver.\n\n— TrustHaul Team`,
          });
          console.log(`[INFO] Notified shipper ${shipper.email} of delivery`);
        }
      }

      // Notify driver when load is cancelled
      if (newStatus === 'cancelled' && load.assigned_driver_user_id) {
        const users = await base44.asServiceRole.entities.User.filter({ id: load.assigned_driver_user_id });
        const driver = users[0];
        if (driver?.email) {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: driver.email,
            subject: `❌ Load Cancelled: "${load.title}"`,
            body: `Hi ${driver.full_name || 'there'},\n\nUnfortunately the load "${load.title}" has been cancelled by the shipper.\n\nCheck the load board for new available loads.\n\n— TrustHaul Team`,
          });
          console.log(`[INFO] Notified driver ${driver.email} of cancellation`);
        }
      }
    }

    // --- NEW BID submitted ---
    if (entityName === 'LoadBid' && eventType === 'create') {
      const bid = data;
      if (!bid?.load_id) return Response.json({ skipped: true });

      const loads = await base44.asServiceRole.entities.Load.filter({ id: bid.load_id });
      const load = loads[0];
      if (!load?.shipper_user_id) return Response.json({ skipped: true });

      const users = await base44.asServiceRole.entities.User.filter({ id: load.shipper_user_id });
      const shipper = users[0];
      if (shipper?.email) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: shipper.email,
          subject: `💰 New Bid on "${load.title}"`,
          body: `Hi ${shipper.full_name || 'there'},\n\nYou have a new bid of $${bid.bid_amount} on your load "${load.title}".\n\n${bid.message ? `Driver's message: "${bid.message}"\n\n` : ''}Log in to TrustHaul to review and accept the bid.\n\n— TrustHaul Team`,
        });
        console.log(`[INFO] Notified shipper ${shipper.email} of new bid`);
      }
    }

    // --- BID accepted/rejected ---
    if (entityName === 'LoadBid' && eventType === 'update') {
      const bid = data;
      const oldBidStatus = old_data?.status;
      const newBidStatus = bid?.status;

      if (!bid?.driver_user_id || oldBidStatus === newBidStatus) return Response.json({ skipped: true });

      const users = await base44.asServiceRole.entities.User.filter({ id: bid.driver_user_id });
      const driver = users[0];

      if (driver?.email && newBidStatus === 'accepted') {
        const loads = await base44.asServiceRole.entities.Load.filter({ id: bid.load_id });
        const load = loads[0];
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: driver.email,
          subject: `🎉 Your Bid Was Accepted!`,
          body: `Hi ${driver.full_name || 'there'},\n\nCongratulations! Your bid of $${bid.bid_amount} was accepted for load "${load?.title || bid.load_id}".\n\nPickup: ${load?.pickup_city}, ${load?.pickup_state}\nDelivery: ${load?.delivery_city}, ${load?.delivery_state}\n\nLog in to TrustHaul to coordinate with the shipper.\n\n— TrustHaul Team`,
        });
        console.log(`[INFO] Notified driver ${driver.email} of accepted bid`);
      }

      if (driver?.email && newBidStatus === 'rejected') {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: driver.email,
          subject: `Bid Update on Load`,
          body: `Hi ${driver.full_name || 'there'},\n\nYour bid of $${bid.bid_amount} was not selected for this load. Keep browsing the load board for new opportunities!\n\n— TrustHaul Team`,
        });
        console.log(`[INFO] Notified driver ${driver.email} of rejected bid`);
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('[ERROR] sendLoadNotification:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});