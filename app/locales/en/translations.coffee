`import Ember from "ember"`
`import SharedTranslationsEn from "shared-goodcity/locales/en/translations"`

I18nTranslationsEn =
  Ember.$.extend true, SharedTranslationsEn,
    "socket_offline_error": "Attempting to connect..."
    "QuotaExceededError": "Site may not work in Safari's <b>private mode.</b> Please try</br><ul><li><a href='https://itunes.apple.com/in/app/goodcity.hk/id1012253845?mt=8' style='color: black!important; background-color: #dee4eb !important;'>Downloading the iOS App</a></li><li>Using regular (not private) mode in Safari</li><li>Using Chrome's private browsing mode</li></ul>"
    "not_now": "Not Now"
    "unexpected_error": "Unexpected Error"
    "confirm": "Confirm"

    "menu":
      "support_gc": "Support GoodCity!"
      "faq": "Frequently Asked Questions"
      "rate": "Rate this app"

    "application":
      "app_menu" : "App Menu"
      "my_offers" : "My Offers"
      "my_account" : "My Account"

    "support":
      "title": "Thank you!"
      "rely_on_donation": "We rely on donations to operate & improve GoodCity.HK for those in greatest need."
      "give_secure": "Give securely now"
      "donation_done_on": "You donated HK${{amount}} on {{date}}."
      "donate_again": "You can give again using your stored payment details or change payment method below."
      "about_goodcity": "GoodCity.HK is an initiative of Crossroads Foundation Limited, a registered, tax-exempt, Hong Kong non-profit organisation."
      "other_methods": "Other giving methods available"
      "via_crossroads": "via Crossroads"
      "contact_us": "Please contact us if:"
      "need_receipt": "You need a tax receipt (for donations over $100)"
      "know_cost": "You want to know more about our running costs"
      "wish_for_sponsor": "You wish to discuss becoming a major sponsor"
      "amount": "HKD Amount"
      "proceed": "Proceed"
      "thanks": "Thank you. Your donation has been processed."
      "display_error": "There is following issue with your donation:"
      "error": "There is an error with payment service. Please try again later."

    "tour":
      "step1.title" : "1. Photograph & describe"
      "quality_items" : "quality items."
      "we_receive" : "What we receive."
      "step2.title" : "2. Submit for live review"
      "chat" : "We'll chat"
      "questions": "if we have questions"
      "step3.title" : "3. Arrange transport"
      "accepted_items" : "for accepted items."
      "quick_easy" : "Quick & easy"
      "step4.title" : "4. People are helped"
      "make_goodcity" : "How you're making a Good City."
      "faq" : "Frequently Asked Questions"

    "register":
      "hk_only" : "Mobile phone # (Hong Kong only)"
      "given_name" : "Given name"
      "family_name" : "Family name"
      "districts" : "Districts"
      "register" : "Register"
      "login" : "Login"
      "fill_all_fields": "Please fill in all the fields."
      "use_of_personal_info": "How we use your personal information"
      "phone_number": "Phone Number"
      "john": "John"
      "doe": "Doe"
      "agree_toc": "By using GoodCity.HK you are agreeing to be bound by these"
      "terms": "terms of use"

    "offers":
      "index":
        "new_donation" : "Make a New Donation"
        "my_offers" : "My offers"
        "total_items" : "Total items: {{itemCount}}"
        "see_more" : "See more..."
        "unread_messages" : "Unread messages: {{unreadMessagesCount}}"
        "complete_offer" : "Complete this Offer"
        "in_review" : "In review"
        "awaiting_review" : "Awaiting review"
        "arrange_transport" : "Please arrange transport"
        "closed" : "Closed"
        "received" : "Received"
        "receiving": "Receiving"
        "van_booked" : "Van booked"
        "van_confirmed": "Van confirmed"
        "picked_up": "Picked up"
        "drop_off" : "You will deliver to Crossroads"
        "self_arranged_van" : "Please book your van in GoGoX or Lalamove"
        "alternate" : "Crossroads collection booked"
        "awaiting_driver" : "Awaiting driver details."
        "driver_name" : "Driver name"
        "phone" : "Phone"
        "vehicle" : "Vehicle"
        "approved" :"Approved Items"
        "rejected" :"Rejected Items"
        "donations": "Donations"
        "inactive": "Inactive: you can re-submit this offer."
        "add_item": "Add Item"
        "new_offer": "New Offer"
        "new_offer_message": "You have an offer still in progress. Are you starting a new offer which will be transported separately or should we add this item to your existing offer?"

    "offer":
      "camera": "Camera"
      "delete": "Delete"
      "messages": "Messages"
      "details" : "Offer details"
      "no_items" : "You don't have any items in this offer yet. Please add your first item!",
      "confirm":
        "heading" : "Confirm"
        "notice": "Because needs change daily and <br> storage is limited we apologise that <br> we sometimes cannot accept <br> some items."
        "review": "Expert volunteers will start reviewing <br> your items immediately."
        "thank": "Thank You!"
        "next" : "OK! Next"
      "submit":
        "heading": "Sale of goods"
        "message": "Occasionally, the best way <br> for a donated item to help the poor <br> is for a charity to sell it. Is sale <br> of item(s) okay?"
      "notifications":
        "title": "Notifications"
        "alert_updates": "Would you like to be alerted when we have questions or status updates for your offer?"
        "no": "No Thanks"
        "notify": "Notify Me"
        "change_ios_settings": "Change your settings to be alerted when we have questions or status updates for your offer."
        "open_settings": "1. Go to Settings."
        "tap_notifications": "2. Tap Notifications."
        "set_notification_on": "3. Set \"Allow Notifications\" to On."
        "open_settings_button": "Open Settings"
        "close": "Close"

      "index":
        "item_count" : "Offer items ({{itemCount}})"
        "add_item" : "Add item"
        "add_items" : "Add items to offer"
        "confirm" : "All Done, Next"
        "review" : "Review Status"
        "cancel" : "Cancel Offer"
        "description" : "Description"
        "condition" : "Condition"

      "offer_details" :
        "heading" : "Offer Details"
        "submitted_status": "Your offer is awaiting review."
        "in_review_status": "Your offer is being reviewed by {{firstName}}."
        "is_collection": "Collection"
        "is_drop_off": "Drop-off"
        "is_self_arranged_van": "Self-arranged van"
        "is_gogovan_order": "Van ordered"
        "is_gogovan_confirm": "Van confirmed"
        "driver_completed": "Driver completed"
        "reviewed_message": "Review complete!"
        "please": "Please"
        "transport": "arrange transport"
        "offer_messages": "General Messages"
        "accepted": "Accepted"
        "not_needed": "Not needed"
        "closed_offer_message": "Offer closed. No items needed, Sorry."
        "offer_received": "Offer received"
        "offer_start_receiving": "{{firstName}} {{lastName}} began receiving items"
        "crossroads_booking_alert" : "We review extra items as quickly as possible. Our collection team can generally only take items that have been reviewed and accepted first.<br><br>If large additional items are accepted it may require us to cancel and re-book your collection."
        "ggv_booking_alert": "We review extra items as quickly as possible. Please don't send items unless we have accepted them.<br><br>If you need to modify your transport booking to accommodate additional items, use the transport tab."

      "transport_details" :
        "heading": "Transport Details"
        "no_items": "There are no items to transport<br> from this offer."
        "arrange_transport": "Arrange Transport"
        "wait_for_transport": "Transport arrangements can be made<br> once the review is complete."
        "accepted_items_count": "Items accepted so far ({{acceptedCount}})"
        "goods_received" : "Goods received on"
        "thank": "Thank You!"
        "receiving": "Your offer is currently being received."

      "display_joyride" :
        "camera": "Tap <i class='fa fa-camera'></i> to add more items"
        "delete": "Tap <i class='fa fa-trash'></i> to cancel your offer"
        "all_done_next": "When all done adding items, proceed to the next step"
        "first_item": "Select an item to view or modify it."

      "cancel":
        "title": "Cancel Offer"
        "confirm_ggv_cancel": "Once GoGoVan confirms the order is cancelled you will be able to proceed to cancel your offer."
        "cancel_offer": "Cancel Offer"

    "item":
      "item_details" : "Item details"
      "donor_description": "Description: {{donorDescription}}"
      "condition": "Condition: {{condition}}"
      "cancel" : "Cancel Item"
      "edit" : "Edit Item"
      "submitted_status": "This item is awaiting review."
      "in_review_status": "This item is being reviewed."
      "accepted_status": "This item has been accepted."
      "rejected_status": "This item has been rejected."
      "cancel_last_item_confirm": "Cancelling the last item will cancel the offer, do you wish to proceed?"
      "cancelled_status": "The offer this item belongs to has been cancelled by {{firstName}} {{lastName}} on"

      "messages":
        "info_text1": "If we have questions when reviewing this item we will chat with you here."
        "info_text2": "If you want to add a comment to this item for our reviewers, type it below."

    "account":
      "edit": "Edit"
      "delete_account": "Delete Account"
      "discard_changes": "Cancel"
      "save_changes": "Save Changes"
      "user_fields":
        "title": "Title"
        "firstName": "Given Name"
        "lastName": "Family Name"
        "mobile": "Mobile Phone"
        "email": "Email"
        "district": "District"

    "delete_account":
      "title": "Delete My Account"
      "section1": "If you delete your account you will no longer be able to log in to GoodCity.HK."
      "section2": "If you wish to use this service again in the future, you will need to create a new account."
      "section3": "Please note that some of your details may be retained to adhere with our compliance and auditing requirements."
      "section4": "All information will be treated in accordance with our policies:"
      "section5": "If you press the button below, you will be immediately logged out from the GoodCity.HK service."
      "yes_delete": "Yes, delete my account"
      "cancel": "Cancel"
      "goback": "Go Back"
      "view_offers": "View offers"
      "sorry1": "Sorry, it is not possible to delete your account while you have an offer in progress."
      "sorry2": "Please close your offer or wait for it to be received."
      "sorry3": "If you would like more assistance, please message us from within the offer."
      "crf_privacy_policy": "Crossroads Foundation Privacy Policy"

    "faqs":
      "title": "FAQs"
      "description" : "GoodCity.HK aims to be the world's most efficient city-wide service for charitable goods donations."
      "questions":
        "question1": "What kinds of items can be donated?"
        "question2": "How do reviewers decide what to accept?"
        "question3": "What transport options are available?"
        "question4": "How are requests for goods made?"
        "question5": "Who is helped by these goods?"
        "question6": "Can I donate goods from outside Hong Kong?"
        "question7": "Why Hong Kong?"

      "answers":
        "answer1":
          "good_condition": "Items in good condition that could be a respectful gift to a charity or disadvantaged recipient."

          "useful": "With GoodCity.HK you can find out if your item(s) are helpful just by taking a photo and waiting a few moments for review. Typical donations are of furniture, household goods, computers, electrical items and much more."

        "answer2":
          "review": "Our reviewers see real-time supply and demand scores for every type of item. They combine this with considerations that vary for different kinds of items: quality requirements, size constraints, hazardous items, logistically difficult items, voltage, compatibility, parts and so on."

          "messaging": "Reviewers can ask you questions via the app's messaging features. This means we can avoid asking you to fill in complicated forms. For most items, your photos and brief notes will be enough."

          "supervisors": "Reviewers also have live access to expert supervisors. Our supervisors have typically been facilitating donated goods in Hong Kong for at least five years. They know how to evaluate unusual offers: like a commercial pizza oven, 100,000 new business suits, boxes of fake flowers and all manner of weird and wonderful things."

        "answer3":
          "gogovan": "<b>Hire a van yourself:</b> book a GoGoX or Lalamove van in their app, pay the driver directly, and tell us in GoodCity when it will arrive."

          "drop_off": "<b>Deliver yourself:</b> through the app you can book a time to drop the items at our Tuen Mun facility yourself."

        "answer4": "Social workers and charity staff have access to a specialised website and mobile app. Currently this is by invitation only but it will ultimately be expanded to all registered social workers and charitable organisations in Hong Kong."

        "answer5":
          "title": "We serve a range of need:"
          "community": "Community/cultural groups"
          "drug": "Drug rehabilitation"
          "education": "Educational institutions"
          "elderly": "Elderly persons"
          "environmental": "Environmental care"
          "families": "Families in need"
          "medical_n_hospitals": "Medical clinics & hospitals"
          "orphanages": "Orphanages"
          "special_needs": "People with special needs"
          "risk": "People at risk"
          "rehabilitation": "Rehabilitation services"
          "service_orgs": "Service organisations"
          "social_enterprise": "Social enterprise"
          "sports": "Sports programmes for the disadvantaged"
          "suicide_prevention": "Suicide prevention services"
          "domestic_workers": "Support for domestic workers"
          "new_arrivals": "Support for new arrivals"
          "women": "Support for women"
          "vocational_training": "Vocational training programmes"
          "animals_welfare": "Welfare of animals"

        "answer6": "No. But if you are a company offering a volume of goods outside Hong Kong you can use another service we developed called"
        "global_hand" : "Global Hand."

        "answer7":
          "hk": "Hong Kong is uniquely positioned to have the world’s most efficient system for charitable goods donation: high population density, small distances, penetration of smart-phones, relative wealth, well organised charitable sector and a climate of growing social awareness."

          "crossroads": "The Crossroads Foundation has been facilitating donated goods in Hong Kong since 1995 and has developed numerous complex online services (e.g. business.un.org) making it an organisation uniquely placed to realise this opportunity."

    # The following are for the I18n example template and can be removed soon.
    "i18nexample.items.heading": "Items"
    "i18nexample.item.title.one": "One item"
    "i18nexample.item.title.other": "{{count}} items"
    "i18nexample.item.new.title": "New item"
    "i18nexample.i18n.pluralisation": "Pluralisation"

`export default I18nTranslationsEn`
