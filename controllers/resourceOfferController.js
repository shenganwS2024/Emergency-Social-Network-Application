import { ResourceOffers } from '../models/ResourceOffers.js';
import { findAllResourceNeeds } from '../models/ResourceNeeds.js';

async function submitResourceOffer(req, res) {
    try {
      const { needId, userId, offeredQuantity, resourceType } = req.body;
  
      const newOffer = new ResourceOffers({
        userId,
        resourceType,
        quantity: offeredQuantity,
      });
      await newOffer.save();
      const resourceNeed = await ResourceNeed.findById(needId);
      if (!resourceNeed) {
        return res.status(404).json({ message: 'Resource need not found.' });
      }
  
      resourceNeed.quantityFulfilled += offeredQuantity;
      resourceNeed.quantityFulfilled = Math.min(resourceNeed.quantityFulfilled, resourceNeed.totalQuantityNeeded);
      resourceNeed.progress = (resourceNeed.quantityFulfilled / resourceNeed.totalQuantityNeeded) * 100;

      await resourceNeed.save();
  
      res.status(200).json({ message: 'Offer successfully submitted and resource need updated.', resourceNeed });
    } catch (error) {
      console.error("Error submitting resource offer:", error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

async function getAllResourceNeeds(req, res) {
  try {
    const resourceNeeds = await findAllResourceNeeds();
    res.status(200).json({ data: { resourceNeeds } });
  } catch (error) {
    console.error("Error getting resource needs:", error);
    res.status(500).send("An error occurred");
  }
}

export { submitResourceOffer, getAllResourceNeeds };
