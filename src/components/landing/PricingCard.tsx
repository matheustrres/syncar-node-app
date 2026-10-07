"use client";
import { ArrowRight, Check } from "lucide-react";
import styles from "./landing.module.css";
interface PricingCardProps {
    planName: string;
    planDescription: string;
    price: string;
    priceDescription: string;
    features: string[];
    buttonText: string;
    buttonNote?: string;
    billingNote?: string;
    isFeatured?: boolean;
    savings?: string;
    isLoading?: boolean;
    onButtonClick: () => void;
}
export default function PricingCard({ planName, planDescription, price, priceDescription, features, buttonText, buttonNote, billingNote, isFeatured = false, savings, isLoading = false, onButtonClick, }: PricingCardProps) {
    return (<article className={`${styles.plan} ${isFeatured ? styles.featuredPlan : ""}`}>
      <div className={styles.planHeading}>
        <h3>{planName}</h3>
        <p>{planDescription}</p>
      </div>
      <div className={styles.planPrice}>
        <strong>{price}</strong>
    <span>{priceDescription}</span>
      </div>
      <div className={styles.planBilling}>
        {billingNote && <p>{billingNote}</p>}
        {savings && <p>{savings}</p>}
      </div>
      <ul className={styles.planFeatures}>
        {features.map((feature) => (<li key={feature}>
        <Check size={17} aria-hidden="true"/>
        <span>{feature}</span>
        </li>))}
      </ul>
      <div className={styles.planAction}>
        <button type="button" onClick={onButtonClick} disabled={isLoading}>
          {isLoading ? "Aguarde..." : buttonText}<ArrowRight size={18} aria-hidden="true"/>
        </button>
        <p>{buttonNote}</p>
      </div>
    </article>);
}
