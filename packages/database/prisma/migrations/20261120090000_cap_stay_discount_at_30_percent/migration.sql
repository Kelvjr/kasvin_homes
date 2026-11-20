-- Preserve existing discount rows while enforcing the configured commercial cap.
ALTER TABLE "LengthOfStayDiscount" DROP CONSTRAINT "stay_discount_valid";
ALTER TABLE "LengthOfStayDiscount" ADD CONSTRAINT "stay_discount_valid" CHECK ("minNights" >= 1 AND "discountBps" BETWEEN 1 AND 3000);
