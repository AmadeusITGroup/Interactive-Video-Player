/** A brand plugin option */
export interface Brand {
  /** Required, the url of the brand */
  destination : string;
  /** @ignore */
  destinationTarget : string;
  /** Required, the image url of the brand */
  image : string;
  /** Required, a title for the brand image */
  title : string
}